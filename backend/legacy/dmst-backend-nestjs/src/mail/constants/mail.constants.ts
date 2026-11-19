export const MAIL_QUEUE_NAME = 'mail-queue';

export enum MailJobName {
  PASSWORD_CHANGED_NOTIFICATION = 'password-changed-notification',
  ACCOUNT_ACTIVATION = 'account-activation',
  RESET_PASSWORD = 'reset-password',
  COLLABORATION_REQUEST = 'collaboration-request',
}
