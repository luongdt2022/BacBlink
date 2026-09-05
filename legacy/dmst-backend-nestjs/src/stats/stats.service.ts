import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Intake, IntakeStatus, IntakeType } from '../intakes/index';
import { User, UserRole } from '../users/user.entity';
import { IntakeSector } from '../intakes/index';
import { Sector } from '../intakes/index';
import {
  Notification,
  NotificationType,
} from '../notifications/notification.entity';
import {
  IntakeStatsResponseDto,
  UserStatsResponseDto,
  MonthlyStatDto,
  IntakeMonthlyBreakdownDto,
  NotificationStatsResponseDto,
  NotificationMonthlyBreakdownDto,
} from './dto/stats.dto';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Intake)
    private readonly intakeRepo: Repository<Intake>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(IntakeSector)
    private readonly intakeSectorRepo: Repository<IntakeSector>,
    @InjectRepository(Sector)
    private readonly sectorRepo: Repository<Sector>,
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {}

  /**
   * Returns a Date boundary for filtering by days, or null if 'all'.
   */
  private getDateBoundary(days: number | 'all'): Date | null {
    if (days === 'all') return null;
    const boundary = new Date();
    boundary.setDate(boundary.getDate() - days);
    return boundary;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Intake stats
  // ──────────────────────────────────────────────────────────────────────────

  async getIntakeStats(
    days: number | 'all' = 30,
  ): Promise<IntakeStatsResponseDto> {
    const boundary = this.getDateBoundary(days);
    const whereClause = boundary
      ? { createdAt: MoreThanOrEqual(boundary) }
      : {};

    // Total
    const total = await this.intakeRepo.count({ where: whereClause });

    // By month — group by year, month, and type so frontend can compare IP vs Challenge.
    const byMonthRaw: {
      year: number;
      month: number;
      type: string;
      count: string;
    }[] = await this.intakeRepo
      .createQueryBuilder('i')
      .select('EXTRACT(YEAR FROM i.createdAt)', 'year')
      .addSelect('EXTRACT(MONTH FROM i.createdAt)', 'month')
      .addSelect('i.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where(boundary ? 'i.createdAt >= :boundary' : '1=1', {
        boundary,
      })
      .groupBy('EXTRACT(YEAR FROM i.createdAt)')
      .addGroupBy('EXTRACT(MONTH FROM i.createdAt)')
      .addGroupBy('i.type')
      .orderBy('EXTRACT(YEAR FROM i.createdAt)', 'ASC')
      .addOrderBy('EXTRACT(MONTH FROM i.createdAt)', 'ASC')
      .getRawMany();

    const monthlyMap = new Map<string, IntakeMonthlyBreakdownDto>();
    for (const row of byMonthRaw) {
      const year = Number(row.year);
      const month = Number(row.month);
      const key = `${year}-${month}`;
      const existing = monthlyMap.get(key) ?? {
        year,
        month,
        ipCount: 0,
        challengeCount: 0,
      };
      const count = parseInt(row.count, 10);

      if ((row.type as IntakeType) === IntakeType.IP) existing.ipCount = count;
      if ((row.type as IntakeType) === IntakeType.CHALLENGE)
        existing.challengeCount = count;

      monthlyMap.set(key, existing);
    }

    const byMonth = Array.from(monthlyMap.values()).sort(
      (a, b) => a.year - b.year || a.month - b.month,
    );

    // By status and type
    const statusRaw: { status: string; type: string; count: string }[] =
      await this.intakeRepo
        .createQueryBuilder('i')
        .select('i.status', 'status')
        .addSelect('i.type', 'type')
        .addSelect('COUNT(*)', 'count')
        .where(boundary ? 'i.createdAt >= :boundary' : '1=1', {
          boundary,
        })
        .groupBy('i.status')
        .addGroupBy('i.type')
        .getRawMany();

    const byStatus = {
      draft: { ipCount: 0, challengeCount: 0 },
      published: { ipCount: 0, challengeCount: 0 },
    };
    for (const r of statusRaw) {
      const count = parseInt(r.count, 10);

      if ((r.status as IntakeStatus) === IntakeStatus.DRAFT) {
        if ((r.type as IntakeType) === IntakeType.IP)
          byStatus.draft.ipCount = count;
        if ((r.type as IntakeType) === IntakeType.CHALLENGE)
          byStatus.draft.challengeCount = count;
      }

      if ((r.status as IntakeStatus) === IntakeStatus.PUBLISHED) {
        if ((r.type as IntakeType) === IntakeType.IP)
          byStatus.published.ipCount = count;
        if ((r.type as IntakeType) === IntakeType.CHALLENGE)
          byStatus.published.challengeCount = count;
      }
    }

    // By type
    const typeRaw: { type: string; count: string }[] = await this.intakeRepo
      .createQueryBuilder('i')
      .select('i.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where(boundary ? 'i.createdAt >= :boundary' : '1=1', {
        boundary,
      })
      .groupBy('i.type')
      .getRawMany();

    const byType = { ip: 0, challenge: 0 };
    for (const r of typeRaw) {
      if ((r.type as IntakeType) === IntakeType.IP)
        byType.ip = parseInt(r.count, 10);
      if ((r.type as IntakeType) === IntakeType.CHALLENGE)
        byType.challenge = parseInt(r.count, 10);
    }

    // By sector — JOIN intake_sectors + sectors
    const sectorRaw: { sector: string; count: string }[] =
      await this.intakeSectorRepo
        .createQueryBuilder('is')
        .select('s.name', 'sector')
        .addSelect('COUNT(DISTINCT is.intakeId)', 'count')
        .innerJoin('is.sector', 's')
        .innerJoin('is.intake', 'i')
        .where(boundary ? 'i.createdAt >= :boundary' : '1=1', {
          boundary,
        })
        .groupBy('s.name')
        .orderBy('COUNT(DISTINCT is.intakeId)', 'DESC')
        .getRawMany();

    const bySector = sectorRaw.map((r) => ({
      sector: r.sector,
      count: parseInt(r.count, 10),
    }));

    return { total, byMonth, byStatus, byType, bySector };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // User stats
  // ──────────────────────────────────────────────────────────────────────────

  async getUserStats(days: number | 'all' = 30): Promise<UserStatsResponseDto> {
    const boundary = this.getDateBoundary(days);

    // Total
    const total = await this.userRepo.count();

    // By month
    const byMonthRaw: { year: number; month: number; count: string }[] =
      await this.userRepo
        .createQueryBuilder('u')
        .select('EXTRACT(YEAR FROM u.createdAt)', 'year')
        .addSelect('EXTRACT(MONTH FROM u.createdAt)', 'month')
        .addSelect('COUNT(*)', 'count')
        .where(boundary ? 'u.createdAt >= :boundary' : '1=1', {
          boundary,
        })
        .groupBy('EXTRACT(YEAR FROM u.createdAt)')
        .addGroupBy('EXTRACT(MONTH FROM u.createdAt)')
        .orderBy('EXTRACT(YEAR FROM u.createdAt)', 'ASC')
        .addOrderBy('EXTRACT(MONTH FROM u.createdAt)', 'ASC')
        .getRawMany();

    const byMonth: MonthlyStatDto[] = byMonthRaw.map((r) => ({
      year: Number(r.year),
      month: Number(r.month),
      count: parseInt(r.count, 10),
    }));

    // By role
    const roleRaw: { role: string; count: string }[] = await this.userRepo
      .createQueryBuilder('u')
      .select('u.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('u.role')
      .getRawMany();

    const byRole = { user: 0, admin: 0 };
    for (const r of roleRaw) {
      if ((r.role as UserRole) === UserRole.USER)
        byRole.user = parseInt(r.count, 10);
      if ((r.role as UserRole) === UserRole.ADMIN)
        byRole.admin = parseInt(r.count, 10);
    }

    // By status (isActive)
    const statusRaw: { isActive: boolean; count: string }[] =
      await this.userRepo
        .createQueryBuilder('u')
        .select('u.isActive', 'isActive')
        .addSelect('COUNT(*)', 'count')
        .groupBy('u.isActive')
        .getRawMany();

    const byStatus = { active: 0, inactive: 0 };
    for (const r of statusRaw) {
      if (r.isActive === true) byStatus.active = parseInt(r.count, 10);
      else byStatus.inactive = parseInt(r.count, 10);
    }

    return { total, byMonth, byRole, byStatus };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Notification stats
  // ──────────────────────────────────────────────────────────────────────────

  async getNotificationStats(
    days: number | 'all' = 30,
  ): Promise<NotificationStatsResponseDto> {
    const boundary = this.getDateBoundary(days);

    const total = await this.notificationRepo.count(
      boundary ? { where: { createdAt: MoreThanOrEqual(boundary) } } : {},
    );

    // By type
    const byTypeRaw: { type: string; count: string }[] =
      await this.notificationRepo
        .createQueryBuilder('n')
        .select('n.type', 'type')
        .addSelect('COUNT(*)', 'count')
        .where(boundary ? 'n.createdAt >= :boundary' : '1=1', { boundary })
        .groupBy('n.type')
        .getRawMany();

    const byType = {
      matchFound: 0,
      collaborationRequestReceived: 0,
      collaborationRequestAccepted: 0,
      collaborationRequestRejected: 0,
    };
    for (const r of byTypeRaw) {
      const count = parseInt(r.count, 10);
      if ((r.type as NotificationType) === NotificationType.MATCH_FOUND)
        byType.matchFound = count;
      if (
        (r.type as NotificationType) ===
        NotificationType.COLLABORATION_REQUEST_RECEIVED
      )
        byType.collaborationRequestReceived = count;
      if (
        (r.type as NotificationType) ===
        NotificationType.COLLABORATION_REQUEST_ACCEPTED
      )
        byType.collaborationRequestAccepted = count;
      if (
        (r.type as NotificationType) ===
        NotificationType.COLLABORATION_REQUEST_REJECTED
      )
        byType.collaborationRequestRejected = count;
    }

    // By month × type
    const byMonthRaw: {
      year: number;
      month: number;
      type: string;
      count: string;
    }[] = await this.notificationRepo
      .createQueryBuilder('n')
      .select('EXTRACT(YEAR FROM n.createdAt)', 'year')
      .addSelect('EXTRACT(MONTH FROM n.createdAt)', 'month')
      .addSelect('n.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where(boundary ? 'n.createdAt >= :boundary' : '1=1', { boundary })
      .groupBy('EXTRACT(YEAR FROM n.createdAt)')
      .addGroupBy('EXTRACT(MONTH FROM n.createdAt)')
      .addGroupBy('n.type')
      .orderBy('EXTRACT(YEAR FROM n.createdAt)', 'ASC')
      .addOrderBy('EXTRACT(MONTH FROM n.createdAt)', 'ASC')
      .getRawMany();

    const monthlyMap = new Map<string, NotificationMonthlyBreakdownDto>();
    for (const row of byMonthRaw) {
      const year = Number(row.year);
      const month = Number(row.month);
      const key = `${year}-${month}`;
      const existing = monthlyMap.get(key) ?? {
        year,
        month,
        matchFound: 0,
        collaborationRequestReceived: 0,
        collaborationRequestAccepted: 0,
        collaborationRequestRejected: 0,
      };
      const count = parseInt(row.count, 10);
      if ((row.type as NotificationType) === NotificationType.MATCH_FOUND)
        existing.matchFound = count;
      if (
        (row.type as NotificationType) ===
        NotificationType.COLLABORATION_REQUEST_RECEIVED
      )
        existing.collaborationRequestReceived = count;
      if (
        (row.type as NotificationType) ===
        NotificationType.COLLABORATION_REQUEST_ACCEPTED
      )
        existing.collaborationRequestAccepted = count;
      if (
        (row.type as NotificationType) ===
        NotificationType.COLLABORATION_REQUEST_REJECTED
      )
        existing.collaborationRequestRejected = count;
      monthlyMap.set(key, existing);
    }
    const byMonth = Array.from(monthlyMap.values()).sort(
      (a, b) => a.year - b.year || a.month - b.month,
    );

    // Read rate
    const readCount = await this.notificationRepo.count(
      boundary
        ? { where: { isRead: true, createdAt: MoreThanOrEqual(boundary) } }
        : { where: { isRead: true } },
    );
    const readRate = total > 0 ? Math.round((readCount / total) * 100) : 0;

    return { total, byType, byMonth, readRate };
  }
}
