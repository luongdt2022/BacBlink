import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ActivationToken } from '../entities/activation-token.entity';

@Injectable()
export class AccountActivationService {
  constructor(
    @InjectRepository(ActivationToken)
    private readonly activationTokenRepo: Repository<ActivationToken>,
    private readonly configService: ConfigService,
  ) {}

  async issueForUser(userId: string): Promise<ActivationToken> {
    const ttlMinutes = parseInt(
      this.configService.get<string>('ACTIVATION_TOKEN_TTL_MINUTES') ?? '60',
      10,
    );

    await this.activationTokenRepo.update(
      { userId, consumedAt: IsNull() },
      { consumedAt: new Date() },
    );

    const token = this.activationTokenRepo.create({
      userId,
      token: randomBytes(24).toString('hex'),
      expiresAt: new Date(Date.now() + ttlMinutes * 60 * 1000),
      consumedAt: null,
    });

    return this.activationTokenRepo.save(token);
  }

  async findValidToken(token: string): Promise<ActivationToken | null> {
    const record = await this.activationTokenRepo.findOne({
      where: {
        token,
        consumedAt: IsNull(),
      },
    });

    if (!record) {
      return null;
    }

    if (record.expiresAt.getTime() <= Date.now()) {
      return null;
    }

    return record;
  }

  async consume(tokenId: string): Promise<void> {
    await this.activationTokenRepo.update(tokenId, { consumedAt: new Date() });
  }
}
