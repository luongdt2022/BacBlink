import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { MailConfig } from '../config/mail.config';
import { MailJobName, MAIL_QUEUE_NAME } from './constants/mail.constants';
import { AccountActivationJobData } from './dto/account-activation-job.dto';
import { CollaborationRequestJobData } from './dto/collaboration-request-job.dto';
import { PasswordChangedNotificationJobData } from './dto/password-changed-notification-job.dto';
import { ResetPasswordJobData } from './dto/reset-password-job.dto';

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  template: string;
  context: Record<string, unknown>;
}

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private templateCache: Map<string, handlebars.TemplateDelegate> = new Map();

  constructor(
    private configService: ConfigService,
    @InjectQueue(MAIL_QUEUE_NAME)
    private readonly mailQueue: Queue<
      | PasswordChangedNotificationJobData
      | AccountActivationJobData
      | ResetPasswordJobData
      | CollaborationRequestJobData
    >,
  ) {
    const mailConfig = this.configService.getOrThrow<MailConfig>('mail');

    this.transporter = nodemailer.createTransport({
      host: mailConfig.host,
      port: mailConfig.port,
      secure: mailConfig.secure,
      auth: mailConfig.auth,
    });
  }

  private compileTemplate(templateName: string): handlebars.TemplateDelegate {
    const cached = this.templateCache.get(templateName);
    if (cached) {
      return cached;
    }

    const templatePath = path.join(
      __dirname,
      'templates',
      `${templateName}.hbs`,
    );
    const templateSource = fs.readFileSync(templatePath, 'utf-8');
    const template = handlebars.compile(templateSource);

    this.templateCache.set(templateName, template);
    return template;
  }

  async sendMail(options: SendMailOptions): Promise<void> {
    const mailConfig = this.configService.getOrThrow<MailConfig>('mail');
    const template = this.compileTemplate(options.template);
    const html = template(options.context);

    const recipients = Array.isArray(options.to)
      ? options.to.join(', ')
      : options.to;

    await this.transporter.sendMail({
      from: `"${mailConfig.fromName}" <${mailConfig.from}>`,
      to: recipients,
      subject: options.subject,
      html,
    });
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    const mailConfig = this.configService.getOrThrow<MailConfig>('mail');
    const loginUrl = `${mailConfig.frontendUrl}/login`;
    await this.sendMail({
      to: email,
      subject: 'Chào mừng đến với DMST',
      template: 'welcome',
      context: { firstName, loginUrl },
    });
  }

  /**
   * Internal method — called by MailProcessor via queue.
   * @internal
   */
  async sendResetPasswordEmail(
    email: string,
    resetToken: string,
  ): Promise<void> {
    const mailConfig = this.configService.getOrThrow<MailConfig>('mail');
    const resetUrl = `${mailConfig.frontendUrl}/reset-password?token=${resetToken}`;

    await this.sendMail({
      to: email,
      subject: 'Đặt lại mật khẩu DMST',
      template: 'reset-password',
      context: { resetUrl },
    });
  }

  async enqueueResetPasswordEmail(
    email: string,
    resetToken: string,
  ): Promise<void> {
    const safeJobId = `reset-password-${Date.now()}`;

    await this.mailQueue.add(
      MailJobName.RESET_PASSWORD,
      { email, resetToken },
      {
        jobId: safeJobId,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: 500,
        removeOnFail: 1000,
      },
    );
  }

  async sendIntakeSubmittedEmail(
    email: string,
    intakeId: number,
  ): Promise<void> {
    await this.sendMail({
      to: email,
      subject: 'Intake Submission Confirmed',
      template: 'intake-submitted',
      context: { intakeId },
    });
  }

  async sendIntakeStatusUpdateEmail(
    email: string,
    intakeId: number,
    status: string,
  ): Promise<void> {
    await this.sendMail({
      to: email,
      subject: `Intake #${intakeId} Status Updated`,
      template: 'intake-status-update',
      context: { intakeId, status },
    });
  }

  async sendPasswordChangedEmail(
    email: string,
    firstName: string | null,
    changedAt: string,
    ipAddress?: string | null,
    userAgent?: string | null,
  ): Promise<void> {
    const mailConfig = this.configService.getOrThrow<MailConfig>('mail');
    const supportLink = `${mailConfig.frontendUrl}/contact`;
    const formattedChangedAt = new Date(changedAt).toLocaleString('vi-VN', {
      hour12: false,
      timeZone: 'Asia/Ho_Chi_Minh',
    });

    await this.sendMail({
      to: email,
      subject: 'Thông báo thay đổi mật khẩu tài khoản',
      template: 'password-changed',
      context: {
        firstName: firstName ?? email,
        email,
        changedAt: formattedChangedAt,
        ipAddress: ipAddress ?? 'Không xác định',
        userAgent: userAgent ?? 'Không xác định',
        supportLink,
        companyName: mailConfig.fromName,
      },
    });
  }

  async sendAccountActivationEmail(
    email: string,
    firstName: string | null,
    activationLink: string,
  ): Promise<void> {
    await this.sendMail({
      to: email,
      subject: 'Xác nhận tài khoản DMST của bạn',
      template: 'account-activation',
      context: {
        firstName: firstName ?? email,
        activationLink,
      },
    });
  }

  async enqueuePasswordChangedEmail(
    userId: string,
    email: string,
    firstName: string | null,
    context?: {
      ipAddress?: string | null;
      userAgent?: string | null;
    },
  ): Promise<void> {
    const changedAt = new Date().toISOString();
    const safeJobId = `password-changed-${userId}-${Date.now()}`;

    await this.mailQueue.add(
      MailJobName.PASSWORD_CHANGED_NOTIFICATION,
      {
        userId,
        email,
        firstName,
        changedAt,
        ipAddress: context?.ipAddress ?? null,
        userAgent: context?.userAgent ?? null,
      },
      {
        jobId: safeJobId,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: 500,
        removeOnFail: 1000,
      },
    );
  }

  async enqueueAccountActivationEmail(
    userId: string,
    email: string,
    firstName: string | null,
    activationToken: string,
  ): Promise<void> {
    const mailConfig = this.configService.getOrThrow<MailConfig>('mail');
    const activationLink = `${mailConfig.frontendUrl}${mailConfig.activationPath}?token=${activationToken}`;
    const safeJobId = `account-activation-${userId}-${Date.now()}`;

    await this.mailQueue.add(
      MailJobName.ACCOUNT_ACTIVATION,
      {
        userId,
        email,
        firstName,
        activationLink,
      },
      {
        jobId: safeJobId,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: 500,
        removeOnFail: 1000,
      },
    );
  }

  async enqueueCollaborationRequestEmail(
    data: CollaborationRequestJobData,
  ): Promise<void> {
    const safeJobId = `collab-request-${data.type}-${data.requestId}-${Date.now()}`;

    await this.mailQueue.add(MailJobName.COLLABORATION_REQUEST, data, {
      jobId: safeJobId,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: 500,
      removeOnFail: 1000,
    });
  }

  async sendCollaborationRequestEmail(
    data: CollaborationRequestJobData,
  ): Promise<void> {
    const mailConfig = this.configService.getOrThrow<MailConfig>('mail');
    const requestUrl = `${mailConfig.frontendUrl}/collaboration-requests/${data.requestId}`;
    const recipientName = data.toFirstName ?? data.toEmail;

    const subjectMap = {
      received: 'Bạn nhận được yêu cầu hợp tác mới',
      accepted: 'Yêu cầu hợp tác của bạn đã được chấp nhận',
      rejected: 'Yêu cầu hợp tác của bạn đã bị từ chối',
    };

    await this.sendMail({
      to: data.toEmail,
      subject: subjectMap[data.type],
      template: 'collaboration-request',
      context: {
        type: data.type,
        recipientName,
        requesterIntakeTitle: data.requesterIntakeTitle,
        targetIntakeTitle: data.targetIntakeTitle,
        requestUrl,
        companyName: mailConfig.fromName,
      },
    });
  }
}
