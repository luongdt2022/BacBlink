import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IAiProvider } from '../interfaces/ai-provider.interface';
import { AiProviderName } from '../constants/ai.constants';
import { AiConfig } from '../config/ai.config';
import {
  AiChatRequest,
  AiChatResponse,
  AiCompletionRequest,
  AiCompletionResponse,
  AiEmbeddingRequest,
  AiEmbeddingResponse,
} from '../interfaces/ai-request.interface';

@Injectable()
export class GeminiProvider implements IAiProvider {
  readonly providerName = AiProviderName.GEMINI;

  constructor(private readonly configService: ConfigService) {}

  private get config() {
    return this.configService.getOrThrow<AiConfig>('ai').gemini;
  }

  chat(_: AiChatRequest): Promise<AiChatResponse> {
    return Promise.reject(new Error('Not implemented'));
  }

  completion(_: AiCompletionRequest): Promise<AiCompletionResponse> {
    return Promise.reject(new Error('Not implemented'));
  }

  embedding(_: AiEmbeddingRequest): Promise<AiEmbeddingResponse> {
    return Promise.reject(new Error('Not implemented'));
  }
}
