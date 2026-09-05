import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Matches } from 'class-validator';
import { EMAIL_WITH_PLUS_REGEX } from './email-validation';

export class ResendActivationDto {
  @ApiProperty({
    example: 'anh.bui4+3@sotatek.com',
    description: 'Email address for pending activation account',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Matches(EMAIL_WITH_PLUS_REGEX, { message: 'email must be a valid email' })
  email: string;
}
