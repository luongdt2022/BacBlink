import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateSettingsDto {
  @ApiPropertyOptional({
    description: 'Auto-trigger AI matching pipeline after intake submission',
  })
  @IsBoolean()
  @IsOptional()
  matchingAuto?: boolean;
}
