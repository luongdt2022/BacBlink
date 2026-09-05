import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { AiProviderName } from '../constants/ai.constants';

export class CompletionRequestDto {
  @ApiProperty()
  @IsString()
  prompt: string;

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
