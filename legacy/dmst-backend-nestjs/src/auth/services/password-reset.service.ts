import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { User } from '../../users/user.entity';
import { PasswordResetToken } from '../entities/password-reset-token.entity';
import { MailService } from '../../mail/mail.service';

const SALT_ROUNDS = 10;

@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);

  constructor(
    @InjectRepository(PasswordResetToken)
    private readonly tokenRepo: Repository<PasswordResetToken>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async issueForEmail(email: string): Promise<boolean> {
    const ttlMinutes = parseInt(
      this.configService.get<string>('PASSWORD_RESET_TOKEN_TTL_MINUTES') ??
        '60',
      10,
    );

    // Find user by email first, then query tokens by userId
    // This avoids the broken LEFT JOIN + relation-based WHERE clause
    const user = await this.userRepo.findOne({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      // Silently succeed to prevent email enumeration attacks
      this.logger.debug(`forgotPassword: no user found for email ${email}`);
      return false;
    }

    // Invalidate any existing unused tokens for this userId
    const existing = await this.tokenRepo.find({
      where: { userId: user.id, consumedAt: IsNull() },
    });
    for (const t of existing) {
      await this.tokenRepo.update(t.id, { consumedAt: new Date() });
    }

    const token = this.tokenRepo.create({
      userId: user.id,
      token: randomBytes(24).toString('hex'),
      expiresAt: new Date(Date.now() + ttlMinutes * 60 * 1000),
      consumedAt: null,
    });
    await this.tokenRepo.save(token);

    try {
      await this.mailService.enqueueResetPasswordEmail(user.email, token.token);
    } catch (err) {
      this.logger.error(
        `Failed to enqueue reset password email for ${user.email}`,
        err instanceof Error ? err.stack : String(err),
      );
    }
    return true;
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const record = await this.tokenRepo.findOne({
      where: {
        token,
        consumedAt: IsNull(),
      },
      relations: ['user'],
    });

    if (!record || record.expiresAt.getTime() <= Date.now()) {
      throw new Error('Token is invalid or has expired');
    }

    // Rotate passwords: current → previous, then set new
    const user = record.user;
    user.previousPasswordHash = user.password;
    user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await this.userRepo.save(user);

    await this.tokenRepo.update(record.id, { consumedAt: new Date() });
  }
}
