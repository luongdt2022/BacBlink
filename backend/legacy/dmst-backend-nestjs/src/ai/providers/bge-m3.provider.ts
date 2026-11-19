import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiProviderName } from '../constants/ai.constants';
import { IAiProvider } from '../interfaces/ai-provider.interface';
import {
  AiChatRequest,
  AiChatResponse,
  AiCompletionRequest,
  AiCompletionResponse,
  AiEmbeddingRequest,
  AiEmbeddingResponse,
} from '../interfaces/ai-request.interface';

interface BgeM3Response {
  embeddings: number[][];
  model: string;
  count: number;
}

@Injectable()
export class BgeM3Provider implements IAiProvider {
  readonly providerName = AiProviderName.BGE_M3;

  private readonly logger = new Logger(BgeM3Provider.name);

  constructor(private readonly configService: ConfigService) {}

  private get baseUrl(): string {
    return this.configService.get<string>(
      'BGE_M3_URL',
      'http://localhost:8003',
    );
  }

  chat(_: AiChatRequest): Promise<AiChatResponse> {
    return Promise.reject(new Error('BgeM3Provider does not support chat'));
  }

  completion(_: AiCompletionRequest): Promise<AiCompletionResponse> {
    return Promise.reject(
      new Error('BgeM3Provider does not support completion'),
    );
  }

  async embedding(request: AiEmbeddingRequest): Promise<AiEmbeddingResponse> {
    const response = await fetch(`${this.baseUrl}/embed/text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: request.input }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`BgeM3Provider HTTP ${response.status}: ${error}`);
    }

    const data = (await response.json()) as BgeM3Response;

    return {
      embeddings: data.embeddings,
      model: data.model,
      provider: this.providerName,
      usage: { totalTokens: 0 },
      raw: data,
    };
  }

  /**
   * Dense vectors plus BGE-M3's sparse lexical weights, via the /embed
   * endpoint rather than /embed/text.
   *
   * The sparse channel is what makes Vietnamese retrieval work: BGE-M3's
   * SentencePiece tokenizer learned word segmentation, so it does not depend on
   * whitespace the way `to_tsvector` and Elasticsearch's standard analyzer do —
   * both of those only split Vietnamese into syllables.
   *
   * Requires the dmst-rag fix that coerces numpy.float32 to float before
   * serialising; without it this endpoint returns 500.
   */
  async embedHybrid(
    texts: string[],
    batchSize = 12,
  ): Promise<Array<{ dense: number[]; sparse: Record<string, number> }>> {
    if (texts.length === 0) return [];

    const out: Array<{ dense: number[]; sparse: Record<string, number> }> = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const slice = texts.slice(i, i + batchSize);
      const response = await fetch(`${this.baseUrl}/embed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: slice,
          batch_size: batchSize,
          return_dense: true,
          return_sparse: true,
          return_colbert: false,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(
          `BgeM3Provider /embed HTTP ${response.status}: ${error}`,
        );
      }

      const data = (await response.json()) as {
        dense: number[][];
        sparse: Array<Record<string, number>> | null;
      };

      for (let j = 0; j < slice.length; j++) {
        out.push({
          dense: data.dense[j],
          sparse: data.sparse?.[j] ?? {},
        });
      }
    }

    this.logger.debug(`Embedded ${texts.length} texts (dense + sparse)`);
    return out;
  }
}
