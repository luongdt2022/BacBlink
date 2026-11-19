import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Cache } from 'cache-manager';
import { AuthResponseKey } from '../constants/auth-response-key.enum';

@Injectable()
export class RegistrationRateLimitService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {}

  private getNumber(key: string, fallback: number): number {
    const raw = this.configService.get<string>(key);
    const parsed = Number.parseInt(raw ?? '', 10);
    return Number.isNaN(parsed) ? fallback : parsed;
  }

  async assertRegisterAllowed(identifier: string): Promise<void> {
    await this.assertWithinLimit(
      `register:${identifier}`,
      this.getNumber('REGISTER_RATE_LIMIT_MAX', 5),
      this.getNumber('REGISTER_RATE_LIMIT_WINDOW_SECONDS', 300),
      AuthResponseKey.REGISTER_RATE_LIMITED,
      'Too many registration attempts. Please try again later.',
    );
  }

  async assertResendAllowed(identifier: string): Promise<void> {
    await this.assertWithinLimit(
      `resend-activation:${identifier}`,
      this.getNumber('RESEND_RATE_LIMIT_MAX', 3),
      this.getNumber('RESEND_RATE_LIMIT_WINDOW_SECONDS', 600),
      AuthResponseKey.RESEND_RATE_LIMITED,
      'Too many resend requests. Please try again later.',
    );
  }

  async assertLoginAllowed(identifier: string): Promise<void> {
    await this.assertWithinLimit(
      `login:${identifier}`,
      this.getNumber('LOGIN_RATE_LIMIT_MAX', 10),
      this.getNumber('LOGIN_RATE_LIMIT_WINDOW_SECONDS', 300),
      AuthResponseKey.LOGIN_RATE_LIMITED,
      'Too many login attempts. Please try again later.',
    );
  }

  private async assertWithinLimit(
    key: string,
    max: number,
    ttlSeconds: number,
    code: AuthResponseKey,
    message: string,
  ): Promise<void> {
    const current = (await this.cacheManager.get<number>(key)) ?? 0;
    if (current >= max) {
      throw new HttpException({ code, message }, HttpStatus.TOO_MANY_REQUESTS);
    }

    await this.cacheManager.set(key, current + 1, ttlSeconds * 1000);
  }
}
