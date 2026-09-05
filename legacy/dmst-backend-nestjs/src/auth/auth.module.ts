import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtConfig } from '../config/jwt.config';
import { MailModule } from '../mail/mail.module';
import { User } from '../users/user.entity';
import { UsersModule } from '../users/users.module';
import { AdminAuthController } from './admin-auth.controller';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ActivationToken } from './entities/activation-token.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { AccountActivationService } from './services/account-activation.service';
import { PasswordResetService } from './services/password-reset.service';
import { RegistrationRateLimitService } from './services/registration-rate-limit.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UsersModule,
    MailModule,
    PassportModule,
    TypeOrmModule.forFeature([ActivationToken, PasswordResetToken, User]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const { secret, expiresIn } =
          configService.getOrThrow<JwtConfig>('jwt');
        return { secret, signOptions: { expiresIn: expiresIn as never } };
      },
    }),
  ],
  controllers: [AuthController, AdminAuthController],
  providers: [
    AuthService,
    JwtStrategy,
    AccountActivationService,
    PasswordResetService,
    RegistrationRateLimitService,
  ],
})
export class AuthModule {}
