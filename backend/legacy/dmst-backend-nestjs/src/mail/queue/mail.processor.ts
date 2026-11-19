import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { MailService } from '../mail.service';
import { MailJobName, MAIL_QUEUE_NAME } from '../constants/mail.constants';
import { AccountActivationJobData } from '../dto/account-activation-job.dto';
import { CollaborationRequestJobData } from '../dto/collaboration-request-job.dto';
import { PasswordChangedNotificationJobData } from '../dto/password-changed-notification-job.dto';
import { ResetPasswordJobData } from '../dto/reset-password-job.dto';

@Processor(MAIL_QUEUE_NAME)
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name);

  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(
    job: Job<
      | PasswordChangedNotificationJobData
      | AccountActivationJobData
      | ResetPasswordJobData
      | CollaborationRequestJobData
    >,
  ): Promise<void> {
    switch (job.name as MailJobName) {
      case MailJobName.PASSWORD_CHANGED_NOTIFICATION: {
        const payload = job.data as PasswordChangedNotificationJobData;
        await this.mailService.sendPasswordChangedEmail(
          payload.email,
          payload.firstName,
          payload.changedAt,
          payload.ipAddress,
          payload.userAgent,
        );
        this.logger.log(
          `Sent password changed email asynchronously for user ${payload.userId}`,
        );
        return;
      }
      case MailJobName.ACCOUNT_ACTIVATION: {
        const payload = job.data as AccountActivationJobData;
        await this.mailService.sendAccountActivationEmail(
          payload.email,
          payload.firstName,
          payload.activationLink,
        );
        this.logger.log(
          `Sent account activation email asynchronously for user ${payload.userId}`,
        );
        return;
      }
      case MailJobName.RESET_PASSWORD: {
        const payload = job.data as ResetPasswordJobData;
        await this.mailService.sendResetPasswordEmail(
          payload.email,
          payload.resetToken,
        );
        this.logger.log(`Sent reset password email to ${payload.email}`);
        return;
      }
      case MailJobName.COLLABORATION_REQUEST: {
        const payload = job.data as CollaborationRequestJobData;
        await this.mailService.sendCollaborationRequestEmail(payload);
        this.logger.log(
          `Sent collaboration request (${payload.type}) email to ${payload.toEmail}`,
        );
        return;
      }
      default:
        throw new Error(`Unknown mail job: ${job.name}`);
    }
  }
}
