import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { AiConfig } from '../config/ai.config';
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

@Injectable()
export class OpenAiProvider implements IAiProvider, OnModuleInit {
  readonly providerName = AiProviderName.OPENAI;

  private client: OpenAI;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const config = this.configService.getOrThrow<AiConfig>('ai').openai;
    this.client = new OpenAI({ apiKey: config.apiKey });
  }

  private get config() {
    return this.configService.getOrThrow<AiConfig>('ai').openai;
  }

  async chat(request: AiChatRequest): Promise<AiChatResponse> {
    const model = request.model ?? this.config.defaultModel;

    const response = await this.client.chat.completions.create({
      model,
      messages: request.messages,
      temperature: request.temperature,
      max_tokens: request.maxTokens,
    });

    const choice = response.choices[0];

    return {
      content: choice.message.content ?? '',
      model: response.model,
      provider: this.providerName,
      usage: response.usage
        ? {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens,
          }
        : undefined,
      raw: response,
    };
  }

  async completion(
    request: AiCompletionRequest,
  ): Promise<AiCompletionResponse> {
    const chatResponse = await this.chat({
      messages: [{ role: 'user', content: request.prompt }],
      provider: request.provider,
      model: request.model,
      temperature: request.temperature,
      maxTokens: request.maxTokens,
    });

    return {
      text: chatResponse.content,
      model: chatResponse.model,
      provider: this.providerName,
      usage: chatResponse.usage,
      raw: chatResponse.raw,
    };
  }

  async embedding(request: AiEmbeddingRequest): Promise<AiEmbeddingResponse> {
    const model = request.model ?? 'text-embedding-3-small';
    const input = Array.isArray(request.input)
      ? request.input
      : [request.input];

    const response = await this.client.embeddings.create({ model, input });

    return {
      embeddings: response.data.map((d) => d.embedding),
      model: response.model,
      provider: this.providerName,
      usage: response.usage
        ? { totalTokens: response.usage.total_tokens }
        : undefined,
      raw: response,
    };
  }
}
