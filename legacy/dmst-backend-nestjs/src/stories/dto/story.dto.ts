import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { StoryType, StoryStatus } from '../story.entity';

export class CreateStoryDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ enum: StoryType })
  @IsEnum(StoryType)
  type: StoryType;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  lesson?: string | null;

  @ApiPropertyOptional({ enum: StoryStatus, default: StoryStatus.DRAFT })
  @IsEnum(StoryStatus)
  @IsOptional()
  status?: StoryStatus;
}

export class UpdateStoryDto extends PartialType(CreateStoryDto) {}

export class QueryStoryDto {
  @ApiPropertyOptional({ enum: StoryType })
  @IsEnum(StoryType)
  @IsOptional()
  type?: StoryType;

  @ApiPropertyOptional({ enum: StoryStatus })
  @IsEnum(StoryStatus)
  @IsOptional()
  status?: StoryStatus;

  @ApiPropertyOptional({ default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}

export class ToggleVisibilityDto {
  @ApiProperty()
  @IsBoolean()
  isHidden: boolean;
}

export enum StorySource {
  USER = 'user',
  ADMIN = 'admin',
  ALL = 'all',
}

export class QueryPublicStoryDto {
  @ApiPropertyOptional({ enum: StorySource, default: StorySource.ALL })
  @IsEnum(StorySource)
  @IsOptional()
  source?: StorySource = StorySource.ALL;

  @ApiPropertyOptional({ default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;
}
