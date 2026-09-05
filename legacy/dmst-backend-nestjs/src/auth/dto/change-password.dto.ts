import { IsString, IsNotEmpty, Matches } from 'class-validator';

export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @IsNotEmpty()
  @Matches(PASSWORD_REGEX, {
    message:
      'Password must be at least 8 characters, including uppercase, lowercase, number, and special character',
  })
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}
