import { registerAs } from '@nestjs/config';

export interface MailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth?: {
    user: string;
    pass: string;
  };
  from: string;
  fromName: string;
  frontendUrl: string;
  activationPath: string;
}

export const mailConfig = registerAs('mail', (): MailConfig => {
  const user = process.env.MAIL_USER ?? '';
  const pass = process.env.MAIL_PASSWORD ?? '';
  return {
    host: process.env.MAIL_HOST ?? 'smtp.gmail.com',
    port: parseInt(process.env.MAIL_PORT ?? '587', 10),
    secure: process.env.MAIL_SECURE === 'true',
    ...(user && pass ? { auth: { user, pass } } : {}),
    from: process.env.MAIL_FROM ?? 'noreply@example.com',
    fromName: process.env.MAIL_FROM_NAME ?? 'DMST System',
    frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    activationPath: process.env.ACTIVATION_PATH ?? '/activate-account',
  };
});
