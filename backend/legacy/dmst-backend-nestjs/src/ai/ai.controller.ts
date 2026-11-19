import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AiService } from './ai.service';
import {
  B2bMarketingRequestDto,
  ChatRequestDto,
  EmbeddingRequestDto,
} from './dto';
import {
  AiChatResponse,
  AiCompletionResponse,
  AiEmbeddingResponse,
} from './interfaces/ai-request.interface';
import { buildB2bMarketingPrompt } from './prompts/b2b-marketing.prompt';

@ApiTags('AI')
@Controller('ai')
@ApiBearerAuth()
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @ApiOperation({
    summary: 'Send a chat request to the configured AI provider via queue',
  })
  async chat(
    @Body() dto: ChatRequestDto,
  ): Promise<{ success: boolean; data: AiChatResponse }> {
    const data = await this.aiService.chat(dto);
    return { success: true, data };
  }

  @Post('completion')
  @ApiOperation({
    summary: '[Test] B2B marketing page content generation via AI queue',
  })
  async completion(
    @Body() dto: B2bMarketingRequestDto,
  ): Promise<{ success: boolean; data: AiCompletionResponse }> {
    const data = await this.aiService.completion({
      prompt: buildB2bMarketingPrompt(dto.title, dto.content),
      provider: dto.provider,
      model: dto.model,
    });
    return { success: true, data };
  }

  @Post('embedding')
  @ApiOperation({
    summary: 'Generate embeddings via the configured AI provider via queue',
  })
  async embedding(
    @Body() dto: EmbeddingRequestDto,
  ): Promise<{ success: boolean; data: AiEmbeddingResponse }> {
    const data = await this.aiService.embedding(dto);
    return { success: true, data };
  }
}
