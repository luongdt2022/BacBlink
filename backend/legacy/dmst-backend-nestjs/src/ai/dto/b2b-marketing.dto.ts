import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AiProviderName } from '../constants/ai.constants';

export class B2bMarketingRequestDto {
  @ApiProperty({
    description: 'Product name / title',
    example: 'HPE ProLiant DL380 Gen11 Server',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description:
      'Detailed product description (may contain HTML and will be sanitized automatically)',
    example: '<p>CPU: 2x Intel Xeon 6, RAM: 256GB...</p>',
  })
  @IsString()
  content: string;

  @ApiPropertyOptional({ enum: AiProviderName })
  @IsEnum(AiProviderName)
  @IsOptional()
  provider?: AiProviderName;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  model?: string;
}
