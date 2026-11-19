import { BullModule } from '@nestjs/bullmq';
import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { aiConfig } from './config/ai.config';
import { AI_QUEUE_NAME } from './constants/ai.constants';
import { AiProviderFactory } from './factories/ai-provider.factory';
import { BgeM3Provider } from './providers/bge-m3.provider';
import { GeminiProvider } from './providers/gemini.provider';
import { OpenAiProvider } from './providers/openai.provider';
import { OpenRouterProvider } from './providers/openrouter.provider';
import { AiProcessor } from './queue/ai.processor';
import { ChunkingService } from './services/chunking.service';

@Module({
  imports: [
    ConfigModule.forFeature(aiConfig),
    BullModule.registerQueue({ name: AI_QUEUE_NAME }),
  ],
  controllers: [AiController],
  providers: [
    AiService,
    AiProviderFactory,
    ChunkingService,
    OpenAiProvider,
    GeminiProvider,
    OpenRouterProvider,
    BgeM3Provider,
    AiProcessor,
  ],
  // BgeM3Provider is exported because SearchService needs embedHybrid() —
  // dense plus sparse lexical weights — which the generic AiService embedding
  // interface does not expose.
  exports: [AiService, BgeM3Provider],
})
export class AiModule implements OnModuleInit {
  constructor(
    private readonly factory: AiProviderFactory,
    private readonly openai: OpenAiProvider,
    private readonly gemini: GeminiProvider,
    private readonly openrouter: OpenRouterProvider,
    private readonly bgeM3: BgeM3Provider,
  ) {}

  onModuleInit() {
    this.factory.register(this.openai);
    this.factory.register(this.gemini);
    this.factory.register(this.openrouter);
    this.factory.register(this.bgeM3);
  }
}
