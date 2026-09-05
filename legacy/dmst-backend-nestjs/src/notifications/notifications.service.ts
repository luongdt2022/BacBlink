import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Notification,
  NotificationType,
  CollaborationRequestPayload,
} from './notification.entity';
import { Intake, IntakeType } from '../intakes/intake.entity';
import { ListNotificationsDto } from './dto/list-notifications.dto';
import { AdminListNotificationsDto } from './dto/admin-list-notifications.dto';

export interface PaginatedNotificationsResult {
  data: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  unreadCount: number | null;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(Intake)
    private readonly intakeRepository: Repository<Intake>,
  ) {}

  async createMatchFoundNotification({
    intakeId,
    matchCount,
  }: {
    intakeId: string;
    matchCount: number;
  }): Promise<void> {
    const intake = await this.intakeRepository.findOne({
      where: { id: intakeId },
      select: ['id', 'userId', 'title', 'aiProcessTitle', 'type'],
    });
    if (!intake || !intake.userId) return;

    const displayTitle: string = intake.aiProcessTitle ?? intake.title;
    const plural = matchCount > 1 ? 's' : '';
    const namespace =
      intake.type === IntakeType.CHALLENGE ? 'challenges' : 'ips';

    const notification = new Notification();
    notification.userId = intake.userId;
    notification.type = NotificationType.MATCH_FOUND;
    notification.payload = {
      message: `System found ${matchCount} matching partner intake${plural} for your intake "${displayTitle}".`,
      navigationPath: `/${namespace}/${intakeId}?tab=matches`,
      intakeId,
      intakeType: intake.type,
      intakeTitle: displayTitle,
      matchCount,
    };
    notification.isRead = false;

    await this.notificationRepository.save(notification);
  }

  async createCollaborationRequestNotification({
    userId,
    type,
    requestId,
    requesterIntakeTitle,
    targetIntakeTitle,
  }: {
    userId: string;
    type: 'received' | 'accepted' | 'rejected';
    requestId: string;
    requesterIntakeTitle: string;
    targetIntakeTitle: string;
  }): Promise<void> {
    const typeMap = {
      received: {
        notificationType: NotificationType.COLLABORATION_REQUEST_RECEIVED,
        message: `You received a collaboration request: "${requesterIntakeTitle}" wants to collaborate with "${targetIntakeTitle}".`,
        navigationPath: `/my/collaboration-requests?tab=received`,
      },
      accepted: {
        notificationType: NotificationType.COLLABORATION_REQUEST_ACCEPTED,
        message: `Your collaboration request for "${requesterIntakeTitle}" has been accepted by "${targetIntakeTitle}".`,
        navigationPath: `/my/collaboration-requests?tab=sent`,
      },
      rejected: {
        notificationType: NotificationType.COLLABORATION_REQUEST_REJECTED,
        message: `Your collaboration request for "${requesterIntakeTitle}" was declined by "${targetIntakeTitle}".`,
        navigationPath: `/my/collaboration-requests?tab=sent`,
      },
    };

    const { notificationType, message, navigationPath } = typeMap[type];

    const payload: CollaborationRequestPayload = {
      message,
      navigationPath,
      requestId,
      requesterIntakeTitle,
      targetIntakeTitle,
    };

    const notification = new Notification();
    notification.userId = userId;
    notification.type = notificationType;
    notification.payload = payload;
    notification.isRead = false;

    await this.notificationRepository.save(notification);
  }

  async findAllForUser(
    userId: string,
    dto: ListNotificationsDto,
  ): Promise<PaginatedNotificationsResult> {
    const { page = 1, limit = 10, isRead, type } = dto;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId };
    if (isRead !== undefined) where.isRead = isRead;
    if (type !== undefined) where.type = type;

    const [data, total] = await this.notificationRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const unreadCount = await this.notificationRepository.count({
      where: { userId, isRead: false },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      unreadCount,
    };
  }

  async markOneRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id, userId },
    });
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    notification.isRead = true;
    return this.notificationRepository.save(notification);
  }

  async markAllRead(userId: string): Promise<{ message: string }> {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );
    return { message: 'All notifications marked as read' };
  }

  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.notificationRepository.count({
      where: { userId, isRead: false },
    });
    return { count };
  }

  async deleteOne(id: string, userId: string): Promise<{ message: string }> {
    const notification = await this.notificationRepository.findOne({
      where: { id, userId },
    });
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    await this.notificationRepository.remove(notification);
    return { message: 'Notification deleted' };
  }

  async deleteAll(userId: string): Promise<{ message: string }> {
    await this.notificationRepository.delete({ userId });
    return { message: 'All notifications deleted' };
  }

  async findAllAdmin(
    dto: AdminListNotificationsDto,
  ): Promise<PaginatedNotificationsResult> {
    const { page = 1, limit = 10, isRead, type, userId } = dto;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (userId !== undefined) where.userId = userId;
    if (isRead !== undefined) where.isRead = isRead;
    if (type !== undefined) where.type = type;

    const [data, total] = await this.notificationRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      unreadCount: null,
    };
  }
}
