import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'abc123def456...' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: 'SecureNewPassword123!' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128)
  newPassword: string;
}
