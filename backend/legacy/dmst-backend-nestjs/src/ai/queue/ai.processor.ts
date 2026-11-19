import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { AiProviderFactory } from '../factories/ai-provider.factory';
import {
  AiProviderName,
  AI_QUEUE_NAME,
  AiJobName,
} from '../constants/ai.constants';
import { AiConfig } from '../config/ai.config';
import {
  AiChatRequest,
  AiChatResponse,
  AiCompletionRequest,
  AiCompletionResponse,
  AiEmbeddingRequest,
  AiEmbeddingResponse,
} from '../interfaces/ai-request.interface';
import { ChunkingService } from '../services/chunking.service';
import { BgeM3Provider } from '../providers/bge-m3.provider';
import { stripHtml } from '../prompts/b2b-marketing.prompt';
import { ChunkEmbedJobData, ChunkEmbedJobResult } from '../dto/chunk-embed.dto';
import { LoggerService } from '../../shared/logger/logger.service';

@Processor(AI_QUEUE_NAME)
export class AiProcessor extends WorkerHost {
  constructor(
    private readonly providerFactory: AiProviderFactory,
    private readonly configService: ConfigService,
    private readonly chunkingService: ChunkingService,
    private readonly logger: LoggerService,
  ) {
    super();
  }

  async process(
    job: Job<
      | AiChatRequest
      | AiCompletionRequest
      | AiEmbeddingRequest
      | ChunkEmbedJobData
    >,
  ): Promise<
    | AiChatResponse
    | AiCompletionResponse
    | AiEmbeddingResponse
    | ChunkEmbedJobResult
  > {
    this.logger.log(`[START] job=${job.name} id=${job.id}`, AiProcessor.name);

    let result:
      | AiChatResponse
      | AiCompletionResponse
      | AiEmbeddingResponse
      | ChunkEmbedJobResult;

    switch (job.name as AiJobName) {
      case AiJobName.CHAT:
        result = await this.handleChat(job as Job<AiChatRequest>);
        break;
      case AiJobName.COMPLETION:
        result = await this.handleCompletion(job as Job<AiCompletionRequest>);
        break;
      case AiJobName.EMBEDDING:
        result = await this.handleEmbedding(job as Job<AiEmbeddingRequest>);
        break;
      case AiJobName.CHUNK_EMBED:
        result = await this.handleChunkEmbed(job as Job<ChunkEmbedJobData>);
        break;
      default:
        throw new Error(`Unknown AI job: ${job.name}`);
    }

    this.logger.log(`[DONE] job=${job.name} id=${job.id}`, AiProcessor.name);

    return result;
  }

  private resolveProviderName(requested?: AiProviderName): AiProviderName {
    return (
      requested ?? this.configService.getOrThrow<AiConfig>('ai').defaultProvider
    );
  }

  private async handleChat(job: Job<AiChatRequest>): Promise<AiChatResponse> {
    const providerName = this.resolveProviderName(job.data.provider);
    this.logger.log(`chat — provider=${providerName}`, AiProcessor.name);
    const provider = this.providerFactory.getProvider(providerName);
    const result = await provider.chat(job.data);
    this.logger.log(
      `chat — done, model=${result.model} tokens=${result.usage?.totalTokens}`,
      AiProcessor.name,
    );
    return result;
  }

  private async handleCompletion(
    job: Job<AiCompletionRequest>,
  ): Promise<AiCompletionResponse> {
    const providerName = this.resolveProviderName(job.data.provider);
    this.logger.log(`completion — provider=${providerName}`, AiProcessor.name);
    const provider = this.providerFactory.getProvider(providerName);
    const result = await provider.completion(job.data);
    this.logger.log(
      `completion — done, model=${result.model} tokens=${result.usage?.totalTokens}`,
      AiProcessor.name,
    );
    return result;
  }

  private async handleEmbedding(
    job: Job<AiEmbeddingRequest>,
  ): Promise<AiEmbeddingResponse> {
    const providerName = this.resolveProviderName(job.data.provider);
    const inputCount = Array.isArray(job.data.input)
      ? job.data.input.length
      : 1;
    this.logger.log(
      `embedding — provider=${providerName} inputs=${inputCount}`,
      AiProcessor.name,
    );
    const provider = this.providerFactory.getProvider(providerName);
    const result = await provider.embedding(job.data);
    this.logger.log(
      `embedding — done, vectors=${result.embeddings.length}`,
      AiProcessor.name,
    );
    return result;
  }

  private async handleChunkEmbed(
    job: Job<ChunkEmbedJobData>,
  ): Promise<ChunkEmbedJobResult> {
    const { text, referenceId, referenceType, chunkSize, chunkOverlap } =
      job.data;

    const plainText = stripHtml(text);

    this.logger.log(
      `chunk-embed [${referenceType}:${referenceId}] — start, textLen=${plainText.length} (stripped from ${text.length})`,
      AiProcessor.name,
    );

    const chunks = await this.chunkingService.chunk(plainText, {
      chunkSize,
      chunkOverlap,
    });

    this.logger.log(
      `chunk-embed [${referenceType}:${referenceId}] — ${chunks.length} chunks created`,
      AiProcessor.name,
    );
    chunks.forEach((chunk, i) => {
      this.logger.log(
        `chunk-embed [${referenceType}:${referenceId}] — chunk[${i}] (${chunk.length} chars): ${chunk.substring(0, 120)}${chunk.length > 120 ? '...' : ''}`,
        AiProcessor.name,
      );
    });

    // One forward pass returns both representations. Calling BGE-M3 again
    // later just to get the sparse weights would double the embedding cost of
    // every intake.
    const provider = this.providerFactory.getProvider(
      AiProviderName.BGE_M3,
    ) as BgeM3Provider;
    this.logger.log(
      `chunk-embed [${referenceType}:${referenceId}] — calling BGE-M3 (dense + sparse)`,
      AiProcessor.name,
    );
    const embedded = await provider.embedHybrid(chunks);

    this.logger.log(
      `chunk-embed [${referenceType}:${referenceId}] — embeddings done, vectors=${embedded.length}`,
      AiProcessor.name,
    );

    return {
      referenceId,
      referenceType,
      chunks: chunks.map((chunkText, index) => ({
        index,
        text: chunkText,
        embedding: embedded[index].dense,
        sparse: embedded[index].sparse,
      })),
    };
  }
}
