import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { JwtConfig } from '../config/jwt.config';
import { MailService } from '../mail/mail.service';
import { ApiResponse } from '../shared/interfaces/api-response.interface';
import { UserRole } from '../users/user.entity';
import { UsersService } from '../users/services/users.service';
import { AuthResponseKey } from './constants/auth-response-key.enum';
import { ActivateAccountDto } from './dto/activate-account.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResendActivationDto } from './dto/resend-activation.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AccountActivationService } from './services/account-activation.service';
import { PasswordResetService } from './services/password-reset.service';
import { RegistrationRateLimitService } from './services/registration-rate-limit.service';
import { JwtPayload } from './strategies/jwt.strategy';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly accountActivationService: AccountActivationService,
    private readonly passwordResetService: PasswordResetService,
    private readonly registrationRateLimitService: RegistrationRateLimitService,
  ) {}

  async register(
    dto: RegisterDto,
    requesterIp: string,
  ): Promise<ApiResponse<{ user: ReturnType<AuthService['sanitizeUser']> }>> {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException({
        code: AuthResponseKey.CONFIRM_PASSWORD_MISMATCH,
        message: 'Confirm password does not match',
      });
    }

    const normalizedEmail = dto.email.trim().toLowerCase();

    await this.registrationRateLimitService.assertRegisterAllowed(
      `${requesterIp}:${normalizedEmail}`,
    );

    let user: Awaited<ReturnType<UsersService['create']>>;
    try {
      user = await this.usersService.create({
        email: normalizedEmail,
        password: dto.password,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        organization: dto.organization,
        isActive: false,
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException({
          code: AuthResponseKey.EMAIL_ALREADY_IN_USE,
          message: 'Email is already in use',
        });
      }
      throw error;
    }

    const activationToken = await this.accountActivationService.issueForUser(
      user.id,
    );

    await this.mailService.enqueueAccountActivationEmail(
      user.id,
      user.email,
      user.firstName,
      activationToken.token,
    );

    return {
      code: AuthResponseKey.REGISTER_SUCCESS_PENDING_ACTIVATION,
      message:
        'Registration successful. Please check your email to activate your account.',
      data: {
        user: this.sanitizeUser(user),
      },
    };
  }

  async activateAccount(
    dto: ActivateAccountDto,
  ): Promise<ApiResponse<null, AuthResponseKey>> {
    const activationToken = await this.accountActivationService.findValidToken(
      dto.token,
    );

    if (!activationToken) {
      throw new BadRequestException({
        code: AuthResponseKey.ACTIVATION_TOKEN_INVALID,
        message:
          'Activation link is invalid or has expired. Please request a new one.',
      });
    }

    const user = await this.usersService.findById(activationToken.userId);
    if (!user.isActive) {
      user.isActive = true;
      await this.usersService.save(user);
    }

    await this.accountActivationService.consume(activationToken.id);

    // Send welcome email after account is activated
    this.mailService
      .sendWelcomeEmail(user.email, user.firstName ?? user.email)
      .catch((err) =>
        this.logger.warn(
          `Failed to send welcome email to ${user.email}: ${String(err)}`,
        ),
      );

    return {
      code: AuthResponseKey.ACCOUNT_ACTIVATED_SUCCESS,
      message: 'Account activated successfully.',
      data: null,
    };
  }

  async resendActivation(
    dto: ResendActivationDto,
    requesterIp: string,
  ): Promise<ApiResponse<null, AuthResponseKey>> {
    const normalizedEmail = dto.email.trim().toLowerCase();

    await this.registrationRateLimitService.assertResendAllowed(
      `${requesterIp}:${normalizedEmail}`,
    );

    const user = await this.usersService.findByEmail(normalizedEmail);
    if (!user) {
      throw new NotFoundException({
        code: AuthResponseKey.ACCOUNT_NOT_FOUND,
        message: 'User account not found',
      });
    }

    if (user.isActive) {
      return {
        code: AuthResponseKey.ACTIVATION_EMAIL_RESENT,
        message: 'Account is already active. Please sign in.',
        data: null,
      };
    }

    const activationToken = await this.accountActivationService.issueForUser(
      user.id,
    );

    await this.mailService.enqueueAccountActivationEmail(
      user.id,
      user.email,
      user.firstName,
      activationToken.token,
    );

    return {
      code: AuthResponseKey.ACTIVATION_EMAIL_RESENT,
      message:
        'If the account exists and is not active, a new activation email has been sent.',
      data: null,
    };
  }

  async login(dto: LoginDto) {
    // Rate limit by normalized email to prevent brute force attacks
    const normalizedEmail = dto.email.trim().toLowerCase();
    await this.registrationRateLimitService.assertLoginAllowed(normalizedEmail);

    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException({
        code: AuthResponseKey.INVALID_CREDENTIALS,
        message: 'Invalid credentials',
      });
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException({
        code: AuthResponseKey.INVALID_CREDENTIALS,
        message: 'Invalid credentials',
      });
    }

    if (!user.isActive) {
      throw new UnauthorizedException({
        code: AuthResponseKey.ACCOUNT_NOT_ACTIVATED,
        message: 'Account is not activated yet',
      });
    }

    if (user.role !== UserRole.USER) {
      throw new UnauthorizedException({
        code: AuthResponseKey.INVALID_CREDENTIALS,
        message: 'Invalid credentials',
      });
    }

    const token = this.signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken: token,
      user: this.sanitizeUser(user),
    };
  }

  async adminLogin(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException({
        code: AuthResponseKey.INVALID_CREDENTIALS,
        message: 'Invalid credentials',
      });
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException({
        code: AuthResponseKey.INVALID_CREDENTIALS,
        message: 'Invalid credentials',
      });
    }

    if (!user.isActive) {
      throw new UnauthorizedException({
        code: AuthResponseKey.ACCOUNT_NOT_ACTIVATED,
        message: 'Account is disabled',
      });
    }

    if (user.role !== UserRole.ADMIN) {
      throw new UnauthorizedException({
        code: AuthResponseKey.INVALID_CREDENTIALS,
        message: 'Invalid credentials',
      });
    }

    const token = this.signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken: token,
      user: this.sanitizeUser(user),
    };
  }

  private signToken(payload: JwtPayload): string {
    const { secret, expiresIn } =
      this.configService.getOrThrow<JwtConfig>('jwt');
    return this.jwtService.sign(payload, {
      secret,
      expiresIn: expiresIn as never,
    });
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
    requestContext?: {
      ipAddress?: string;
      userAgent?: string;
    },
  ): Promise<ApiResponse<null, AuthResponseKey>> {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException({
        code: AuthResponseKey.CONFIRM_PASSWORD_MISMATCH,
        message: 'Confirm password does not match',
      });
    }

    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException();

    const isCurrent = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isCurrent) {
      throw new UnauthorizedException({
        code: AuthResponseKey.CURRENT_PASSWORD_INCORRECT,
        message: 'Current password is incorrect',
      });
    }

    const isSameAsCurrent = await bcrypt.compare(
      dto.newPassword,
      user.password,
    );
    if (isSameAsCurrent) {
      throw new BadRequestException(
        'New password cannot be the same as the current password',
      );
    }

    if (user.previousPasswordHash) {
      const isSameAsPrevious = await bcrypt.compare(
        dto.newPassword,
        user.previousPasswordHash,
      );
      if (isSameAsPrevious) {
        throw new BadRequestException(
          'New password cannot be the same as the recently used password',
        );
      }
    }

    user.previousPasswordHash = user.password;
    user.password = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);
    await this.usersService.save(user);

    try {
      await this.mailService.enqueuePasswordChangedEmail(
        user.id,
        user.email,
        user.firstName,
        {
          ipAddress: requestContext?.ipAddress,
          userAgent: requestContext?.userAgent,
        },
      );
    } catch (error) {
      this.logger.error(
        `Failed to enqueue password changed email for user ${userId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }

    this.logger.log(`Password changed successfully for user ${userId}`);

    return {
      code: AuthResponseKey.PASSWORD_CHANGED_SUCCESS,
      message: 'Password changed successfully. Please log in again.',
      data: null,
    };
  }

  async forgotPassword(
    email: string,
  ): Promise<{ code: string; message: string; data: null }> {
    const normalizedEmail = email.trim().toLowerCase();
    // Silently succeed to prevent email enumeration
    await this.passwordResetService.issueForEmail(normalizedEmail);
    return {
      code: 'FORGOT_PASSWORD_EMAIL_SENT',
      message:
        'If the email exists in our system, a password reset link has been sent.',
      data: null,
    };
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<ApiResponse<null, AuthResponseKey>> {
    try {
      await this.passwordResetService.resetPassword(token, newPassword);
    } catch {
      throw new BadRequestException({
        code: AuthResponseKey.RESET_PASSWORD_TOKEN_INVALID,
        message:
          'Reset link is invalid or has expired. Please request a new one.',
      });
    }

    return {
      code: AuthResponseKey.RESET_PASSWORD_SUCCESS,
      message:
        'Password reset successfully. Please log in with your new password.',
      data: null,
    };
  }

  private sanitizeUser(user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: UserRole;
    isActive: boolean;
    createdAt: Date;
  }) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }
}
