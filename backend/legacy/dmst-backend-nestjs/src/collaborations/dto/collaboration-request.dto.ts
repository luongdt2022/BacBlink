import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { IsNumber, Min } from 'class-validator';

export class CreateCollaborationRequestDto {
  @ApiProperty({ description: "UUID of the requester's own intake" })
  @IsUUID()
  requesterIntakeId: string;

  @ApiProperty({ description: 'UUID of the target intake to collaborate with' })
  @IsUUID()
  targetIntakeId: string;

  @ApiPropertyOptional({
    description: 'Optional message to the target user',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;
}

export class ListCollaborationRequestsDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;
}
