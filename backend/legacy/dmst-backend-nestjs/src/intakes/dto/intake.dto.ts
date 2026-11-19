import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsUUID,
  IsInt,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IntakeType, IntakeStatus } from '../intake.entity';

export class CreateIntakeDto {
  @ApiProperty({ example: 'AI Cancer Diagnosis System' })
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  aiProcessedContent?: string;

  @ApiPropertyOptional({ enum: IntakeType, example: IntakeType.IP })
  @IsEnum(IntakeType)
  @IsOptional()
  type?: IntakeType;

  @ApiPropertyOptional({ enum: IntakeStatus, example: IntakeStatus.DRAFT })
  @IsEnum(IntakeStatus)
  @IsOptional()
  status?: IntakeStatus;

  @ApiPropertyOptional({ type: [String], example: ['uuid1', 'uuid2'] })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  sectorIds?: string[];

  @ApiPropertyOptional({ example: 'uuid-of-category' })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  confidentialLevel2Content?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  confidentialLevel2AiProcessedContent?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  confidentialLevel3Content?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  confidentialLevel3AiProcessedContent?: string;
}

export class UpdateIntakeDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  aiProcessedContent?: string;

  @ApiPropertyOptional({ enum: IntakeType })
  @IsEnum(IntakeType)
  @IsOptional()
  type?: IntakeType;

  @ApiPropertyOptional({ enum: IntakeStatus })
  @IsEnum(IntakeStatus)
  @IsOptional()
  status?: IntakeStatus;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  sectorIds?: string[];

  @ApiPropertyOptional({ example: 'uuid-of-category' })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  confidentialLevel2Content?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  confidentialLevel2AiProcessedContent?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  confidentialLevel3Content?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  confidentialLevel3AiProcessedContent?: string;
}

export class FindMatchesQueryDto {
  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 50 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  limit?: number = 10;

  /**
   * RRF scale, not the old BM25 scale — four channels cap at 4 × 1/61 ≈ 0.066.
   * The previous default of 1.5 would now reject every result.
   */
  @ApiPropertyOptional({
    default: 0,
    minimum: 0,
    description: 'Minimum RRF score (0 – ~0.066). Not the old BM25 scale.',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minScore?: number = 0;
}

export class QueryIntakeDto {
  @ApiPropertyOptional({ enum: IntakeType })
  @IsEnum(IntakeType)
  @IsOptional()
  type?: IntakeType;

  @ApiPropertyOptional({ enum: IntakeStatus })
  @IsEnum(IntakeStatus)
  @IsOptional()
  status?: IntakeStatus;

  @ApiPropertyOptional({ example: 'uuid-of-sector' })
  @IsUUID()
  @IsOptional()
  sectorId?: string;

  @ApiPropertyOptional({ example: 'uuid-of-category' })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ example: 'robot' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ example: 1, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ example: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;
}

export class MatchesQueryDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;
}
