export interface PasswordChangedNotificationJobData {
  userId: string;
  email: string;
  firstName: string | null;
  changedAt: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}
