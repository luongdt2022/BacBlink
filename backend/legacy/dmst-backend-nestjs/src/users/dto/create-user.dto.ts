import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Unique user email',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    example: 'StrongP@ss1',
    description: 'Password (optional, defaults to "12345678")',
  })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({ example: 'John', description: 'First name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe', description: 'Last name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional({ example: '0123456789', description: 'Phone number' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({
    example: 'Acme Corp',
    description: 'Organization name',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  organization?: string;

  @ApiPropertyOptional({
    example: true,
    description:
      'Activation status for internal flows (defaults to true if omitted)',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
