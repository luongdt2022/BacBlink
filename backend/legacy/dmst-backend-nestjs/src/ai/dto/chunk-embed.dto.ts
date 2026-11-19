import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export interface ChunkEmbedJobData {
  text: string;
  referenceId: string;
  referenceType: string;
  chunkSize?: number;
  chunkOverlap?: number;
}

export interface ChunkEmbedJobResult {
  referenceId: string;
  referenceType: string;
  chunks: Array<{
    index: number;
    text: string;
    /** Dense vector, 1024-dim. */
    embedding: number[];
    /**
     * BGE-M3 sparse lexical weights, token id -> weight.
     *
     * Carried here because BGE-M3 returns dense and sparse from a single
     * forward pass. Fetching them separately would run the model twice over
     * the same chunks — roughly 430ms per batch of wasted CPU per intake.
     */
    sparse: Record<string, number>;
  }>;
}

export class ChunkEmbedRequestDto {
  @ApiProperty({ description: 'Text to chunk and embed' })
  @IsString()
  text: string;

  @ApiProperty({ description: 'ID of the source record (e.g. intake ID)' })
  @IsString()
  referenceId: string;

  @ApiProperty({ description: 'Type of the source record (e.g. "intake")' })
  @IsString()
  referenceType: string;

  @ApiPropertyOptional({ default: 512 })
  @IsNumber()
  @IsOptional()
  chunkSize?: number;

  @ApiPropertyOptional({ default: 64 })
  @IsNumber()
  @IsOptional()
  chunkOverlap?: number;
}
