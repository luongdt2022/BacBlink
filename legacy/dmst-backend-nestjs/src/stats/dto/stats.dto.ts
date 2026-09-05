import { IsOptional, Validate } from 'class-validator';
import { Transform } from 'class-transformer';

export class MonthlyStatDto {
  year: number;
  month: number;
  count: number;
}

export class IntakeMonthlyBreakdownDto {
  year: number;
  month: number;
  ipCount: number;
  challengeCount: number;
}

export class IntakeStatusBreakdownValueDto {
  ipCount: number;
  challengeCount: number;
}

export class IntakeStatsResponseDto {
  total: number;
  byMonth: IntakeMonthlyBreakdownDto[];
  byStatus: {
    draft: IntakeStatusBreakdownValueDto;
    published: IntakeStatusBreakdownValueDto;
  };
  byType: { ip: number; challenge: number };
  bySector: { sector: string; count: number }[];
}

export class UserStatsResponseDto {
  total: number;
  byMonth: MonthlyStatDto[];
  byRole: { user: number; admin: number };
  byStatus: { active: number; inactive: number };
}

/**
 * Custom validator: allows numeric values 1–90 or the literal string 'all'.
 */
function isValidDays(value: unknown): boolean {
  if (value === 'all') return true;
  const n = typeof value === 'string' ? parseInt(value) : (value as number);
  return Number.isInteger(n) && n >= 1 && n <= 90;
}

export class NotificationMonthlyBreakdownDto {
  year: number;
  month: number;
  matchFound: number;
  collaborationRequestReceived: number;
  collaborationRequestAccepted: number;
  collaborationRequestRejected: number;
}

export class NotificationStatsResponseDto {
  total: number;
  byType: {
    matchFound: number;
    collaborationRequestReceived: number;
    collaborationRequestAccepted: number;
    collaborationRequestRejected: number;
  };
  byMonth: NotificationMonthlyBreakdownDto[];
  readRate: number;
}

export class StatsQueryDto {
  @IsOptional()
  @Validate(isValidDays)
  @Transform(({ value }) => (value === 'all' ? 'all' : parseInt(value)))
  days?: number | 'all' = 30;
}
