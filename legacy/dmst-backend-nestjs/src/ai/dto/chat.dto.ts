import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { AiProviderName } from '../constants/ai.constants';

export class AiMessageDto {
  @ApiProperty({ enum: ['system', 'user', 'assistant'] })
  @IsEnum(['system', 'user', 'assistant'])
  role: 'system' | 'user' | 'assistant';

  @ApiProperty()
  @IsString()
  content: string;
}

export class ChatRequestDto {
  @ApiProperty({ type: [AiMessageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AiMessageDto)
  messages: AiMessageDto[];

  @ApiPropertyOptional({ enum: AiProviderName })
  @IsEnum(AiProviderName)
  @IsOptional()
  provider?: AiProviderName;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  model?: string;

  @ApiPropertyOptional({ minimum: 0, maximum: 2 })
  @IsNumber()
  @Min(0)
  @Max(2)
  @IsOptional()
  temperature?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  maxTokens?: number;
}
