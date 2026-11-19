import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, QueueEvents } from 'bullmq';
import { RedisConfig } from '../config/redis.config';
import { AI_QUEUE_NAME, AiJobName } from './constants/ai.constants';
import {
  ChatRequestDto,
  ChunkEmbedJobData,
  ChunkEmbedJobResult,
  CompletionRequestDto,
  EmbeddingRequestDto,
} from './dto';
import {
  AiChatResponse,
  AiCompletionResponse,
  AiEmbeddingResponse,
} from './interfaces/ai-request.interface';

@Injectable()
export class AiService implements OnModuleInit, OnModuleDestroy {
  private queueEvents: QueueEvents;

  constructor(
    @InjectQueue(AI_QUEUE_NAME) private readonly aiQueue: Queue,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    const redis = this.configService.getOrThrow<RedisConfig>('redis');
    this.queueEvents = new QueueEvents(AI_QUEUE_NAME, {
      connection: { url: redis.url },
    });
  }

  async onModuleDestroy() {
    await this.queueEvents.close();
  }

  async chat(dto: ChatRequestDto): Promise<AiChatResponse> {
    const job = await this.aiQueue.add(AiJobName.CHAT, dto);
    return job.waitUntilFinished(this.queueEvents) as Promise<AiChatResponse>;
  }

  async completion(dto: CompletionRequestDto): Promise<AiCompletionResponse> {
    const job = await this.aiQueue.add(AiJobName.COMPLETION, dto);
    return job.waitUntilFinished(
      this.queueEvents,
    ) as Promise<AiCompletionResponse>;
  }

  async embedding(dto: EmbeddingRequestDto): Promise<AiEmbeddingResponse> {
    const job = await this.aiQueue.add(AiJobName.EMBEDDING, dto);
    return job.waitUntilFinished(
      this.queueEvents,
    ) as Promise<AiEmbeddingResponse>;
  }

  async chunkEmbed(data: ChunkEmbedJobData): Promise<ChunkEmbedJobResult> {
    const job = await this.aiQueue.add(AiJobName.CHUNK_EMBED, data);
    return job.waitUntilFinished(
      this.queueEvents,
    ) as Promise<ChunkEmbedJobResult>;
  }
}
