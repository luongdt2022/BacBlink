import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { User } from '../users/user.entity';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { ActivateAccountDto } from './dto/activate-account.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResendActivationDto } from './dto/resend-activation.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

type HeaderValue = string | string[] | undefined;

function getFirstHeaderValue(header: HeaderValue): string | null {
  if (!header) return null;
  if (Array.isArray(header)) {
    return getFirstHeaderValue(header[0]);
  }
  const value = header.trim();
  return value || null;
}

function normalizeIp(ip: string | undefined | null): string | null {
  if (!ip) return null;
  const value = ip.trim();
  if (!value) return null;
  if (value.includes(',')) {
    return normalizeIp(value.split(',')[0]);
  }
  if (value === '::1') return '127.0.0.1';
  if (value.startsWith('[') && value.endsWith(']')) {
    return normalizeIp(value.slice(1, -1));
  }
  if (value.startsWith('::ffff:')) return value.slice(7);
  return value;
}

function parseForwardedHeader(header: HeaderValue): string | null {
  const value = getFirstHeaderValue(header);
  if (!value) return null;

  const firstPart = value.split(',')[0]?.trim();
  if (!firstPart) return null;

  const match = firstPart.match(/for=(?:"?)(\[?[^\s;,"\\]+]?)/i);
  if (!match?.[1]) return null;

  return normalizeIp(match[1]);
}

function resolveClientIp(req: Request): string {
  const xForwardedFor = normalizeIp(
    getFirstHeaderValue(req.headers['x-forwarded-for']),
  );
  if (xForwardedFor) return xForwardedFor;

  const forwarded = parseForwardedHeader(req.headers.forwarded);
  if (forwarded) return forwarded;

  const xRealIp = normalizeIp(getFirstHeaderValue(req.headers['x-real-ip']));
  if (xRealIp) return xRealIp;

  return (
    normalizeIp(req.ip) ?? normalizeIp(req.socket.remoteAddress) ?? 'unknown'
  );
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new account' })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  @ApiResponse({ status: 429, description: 'Too many registration attempts' })
  register(@Body() dto: RegisterDto, @Req() req: Request) {
    return this.authService.register(dto, resolveClientIp(req));
  }

  @Post('activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate account with one-time token' })
  @ApiResponse({ status: 200, description: 'Account activated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  activateAccount(@Body() dto: ActivateAccountDto) {
    return this.authService.activateAccount(dto);
  }

  @Post('resend-activation')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend account activation email' })
  @ApiResponse({ status: 200, description: 'Activation email resent' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 429, description: 'Too many resend attempts' })
  resendActivation(@Body() dto: ResendActivationDto, @Req() req: Request) {
    return this.authService.resendActivation(dto, resolveClientIp(req));
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({ status: 200, description: 'Current user info' })
  me(@CurrentUser() user: User) {
    const { password, ...rest } = user;
    void password;
    return rest;
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change current user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({
    status: 400,
    description: 'Validation error or new password invalid',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or wrong current password',
  })
  changePassword(
    @CurrentUser() user: User,
    @Body() dto: ChangePasswordDto,
    @Req() req: Request,
  ) {
    return this.authService.changePassword(user.id, dto, {
      ipAddress: resolveClientIp(req),
      userAgent: req.get('user-agent') ?? 'unknown',
    });
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request a password reset email' })
  @ApiResponse({
    status: 200,
    description: 'If the email exists, a reset link has been sent',
  })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using a token from email' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }
}
