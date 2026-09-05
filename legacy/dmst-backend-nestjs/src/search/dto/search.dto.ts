import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsNumber,
  IsArray,
  Min,
  Max,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IntakeType } from '../../intakes/intake.entity';

export class SearchDto {
  @ApiProperty({ example: 'smart warehouse management solution' })
  @IsString()
  @IsNotEmpty()
  query: string;

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  limit?: number = 10;

  @ApiProperty({ required: false, enum: IntakeType })
  @IsOptional()
  @IsEnum(IntakeType)
  type?: IntakeType;

  @ApiProperty({
    required: false,
    description: 'Filter by sector ID',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sectorIds?: string[];

  /**
   * Results are now ranked by Reciprocal Rank Fusion, whose scores live on a
   * completely different scale from the Elasticsearch BM25 scores this
   * replaced: four channels give a theoretical maximum of 4 × 1/61 ≈ 0.066.
   * The old default of 2.0 would reject every result, so the default is 0.
   * Scores stored before and after the migration are NOT comparable.
   */
  @ApiProperty({
    required: false,
    default: 0,
    description:
      'Minimum RRF score. Typical values are between 0 and 0.066 — this is not the old BM25 scale.',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minScore?: number = 0;

  @ApiProperty({
    required: false,
    description: 'Restrict to these intake statuses. Applied before top-K.',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  statuses?: string[];

  @ApiProperty({
    required: false,
    description:
      'Drop intakes owned by this user. Applied before top-K, so a valid candidate is never lost to the cut.',
  })
  @IsOptional()
  @IsString()
  excludeUserId?: string;
}

export class SearchHitDto {
  @ApiProperty()
  intakeId: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  aiProcessTitle: string | null;

  @ApiProperty()
  matchedChunk: string;

  @ApiProperty()
  chunkIndex: number;

  @ApiProperty()
  score: number;

  @ApiProperty()
  intakeType: string;

  @ApiProperty({ type: [String] })
  sectorIds: string[];

  @ApiProperty({ type: [String] })
  sectorNames: string[];
}

export class SearchResultDto {
  @ApiProperty({ type: [SearchHitDto] })
  hits: SearchHitDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  took: number;
}
