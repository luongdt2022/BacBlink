import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AiProviderName } from '../constants/ai.constants';

export class EmbeddingRequestDto {
  @ApiProperty({
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
  })
  @IsString()
  input: string | string[];

  @ApiPropertyOptional({ enum: AiProviderName })
  @IsEnum(AiProviderName)
  @IsOptional()
  provider?: AiProviderName;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  model?: string;
}
