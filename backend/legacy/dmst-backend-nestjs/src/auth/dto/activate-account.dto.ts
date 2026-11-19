import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ActivateAccountDto {
  @ApiProperty({
    example: 'e5f9cc7e03f44ac18f7f7c2385fd89f7',
    description: 'One-time activation token from email link',
  })
  @IsString()
  @MinLength(16)
  token: string;
}
