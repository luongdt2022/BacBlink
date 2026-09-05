import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Intake, IntakeStatus, IntakeType } from '../intakes/intake.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { MailService } from '../mail/mail.service';
import { User } from '../users/user.entity';
import {
  CollaborationRequest,
  CollaborationRequestStatus,
} from './collaboration-request.entity';
import {
  CreateCollaborationRequestDto,
  ListCollaborationRequestsDto,
} from './dto/collaboration-request.dto';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CollaborationHistoryItem {
  id: string;
  direction: 'sent' | 'received';
  status: CollaborationRequestStatus;
  counterpartName: string;
  counterpartEmail: string;
  intakeTitle: string;
  intakeType: IntakeType;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class CollaborationsService {
  private readonly logger = new Logger(CollaborationsService.name);

  constructor(
    @InjectRepository(CollaborationRequest)
    private readonly requestRepository: Repository<CollaborationRequest>,
    @InjectRepository(Intake)
    private readonly intakeRepository: Repository<Intake>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationsService: NotificationsService,
    private readonly mailService: MailService,
  ) {}

  async create(
    dto: CreateCollaborationRequestDto,
    requesterUserId: string,
  ): Promise<CollaborationRequest> {
    const { requesterIntakeId, targetIntakeId, message } = dto;

    // Load both intakes in parallel
    const [requesterIntake, targetIntake] = await Promise.all([
      this.intakeRepository.findOne({
        where: { id: requesterIntakeId },
        select: ['id', 'userId', 'type', 'status', 'title', 'aiProcessTitle'],
      }),
      this.intakeRepository.findOne({
        where: { id: targetIntakeId },
        select: ['id', 'userId', 'type', 'status', 'title', 'aiProcessTitle'],
      }),
    ]);

    if (!requesterIntake) {
      throw new NotFoundException(`Intake ${requesterIntakeId} not found`);
    }
    if (!targetIntake) {
      throw new NotFoundException(`Intake ${targetIntakeId} not found`);
    }

    // Ownership check
    if (requesterIntake.userId !== requesterUserId) {
      throw new ForbiddenException(
        'You can only send collaboration requests from your own intakes',
      );
    }

    // Cannot collaborate with yourself
    if (requesterIntake.userId === targetIntake.userId) {
      throw new BadRequestException(
        'You cannot send a collaboration request to your own intake',
      );
    }

    // Both intakes must be published
    if (requesterIntake.status !== IntakeStatus.PUBLISHED) {
      throw new BadRequestException(
        'Your intake must be published to send a collaboration request',
      );
    }
    if (targetIntake.status !== IntakeStatus.PUBLISHED) {
      throw new BadRequestException(
        'The target intake must be published to receive a collaboration request',
      );
    }

    // Intakes must be of opposite types (IP ↔ Challenge)
    if (requesterIntake.type === targetIntake.type) {
      throw new BadRequestException(
        'Collaboration requests must be between an IP intake and a Challenge intake',
      );
    }

    // No duplicate pending request between these two intakes
    const existing = await this.requestRepository.findOne({
      where: [
        {
          requesterIntakeId,
          targetIntakeId,
          status: CollaborationRequestStatus.PENDING,
        },
        {
          requesterIntakeId: targetIntakeId,
          targetIntakeId: requesterIntakeId,
          status: CollaborationRequestStatus.PENDING,
        },
      ],
    });
    if (existing) {
      throw new BadRequestException(
        'A pending collaboration request already exists between these two intakes',
      );
    }

    const targetUserId = targetIntake.userId!;

    const request = this.requestRepository.create({
      requesterIntakeId,
      targetIntakeId,
      requesterUserId,
      targetUserId,
      message: message ?? null,
      status: CollaborationRequestStatus.PENDING,
    });

    const saved = await this.requestRepository.save(request);

    // Fire-and-forget: notification + email
    void this.notifyCollaborationRequestReceived(
      saved,
      requesterIntake,
      targetIntake,
    );

    return saved;
  }

  async accept(
    requestId: string,
    targetUserId: string,
  ): Promise<CollaborationRequest> {
    const request = await this.findOneOrFail(requestId);

    if (request.targetUserId !== targetUserId) {
      throw new ForbiddenException(
        'You can only accept collaboration requests sent to you',
      );
    }

    if (request.status !== CollaborationRequestStatus.PENDING) {
      throw new BadRequestException(
        `Cannot accept a request with status "${request.status}"`,
      );
    }

    // Accept this request
    request.status = CollaborationRequestStatus.ACCEPTED;
    const accepted = await this.requestRepository.save(request);

    // Auto-reject all other pending requests for the same target intake
    await this.rejectOtherPendingRequests(request.targetIntakeId, requestId);

    // Fire-and-forget: notification + email to requester
    void this.notifyCollaborationRequestAccepted(accepted);

    return this.findOneWithRelations(requestId);
  }

  async reject(
    requestId: string,
    targetUserId: string,
  ): Promise<CollaborationRequest> {
    const request = await this.findOneOrFail(requestId);

    if (request.targetUserId !== targetUserId) {
      throw new ForbiddenException(
        'You can only reject collaboration requests sent to you',
      );
    }

    if (request.status !== CollaborationRequestStatus.PENDING) {
      throw new BadRequestException(
        `Cannot reject a request with status "${request.status}"`,
      );
    }

    request.status = CollaborationRequestStatus.REJECTED;
    const rejected = await this.requestRepository.save(request);

    // Fire-and-forget: notification + email to requester
    void this.notifyCollaborationRequestRejected(rejected);

    return rejected;
  }

  async cancel(
    requestId: string,
    requesterUserId: string,
  ): Promise<{ message: string }> {
    const request = await this.findOneOrFail(requestId);

    if (request.requesterUserId !== requesterUserId) {
      throw new ForbiddenException(
        'You can only cancel your own collaboration requests',
      );
    }

    if (request.status !== CollaborationRequestStatus.PENDING) {
      throw new BadRequestException(
        `Cannot cancel a request with status "${request.status}"`,
      );
    }

    request.status = CollaborationRequestStatus.CANCELLED;
    await this.requestRepository.save(request);

    return { message: 'Collaboration request cancelled' };
  }

  async findSent(
    requesterUserId: string,
    dto: ListCollaborationRequestsDto,
  ): Promise<PaginatedResult<CollaborationRequest>> {
    const { page = 1, limit = 20 } = dto;
    const [data, total] = await this.requestRepository.findAndCount({
      where: { requesterUserId },
      relations: [
        'requesterIntake',
        'requesterIntake.intakeSectors',
        'requesterIntake.intakeSectors.sector',
        'targetIntake',
        'targetIntake.intakeSectors',
        'targetIntake.intakeSectors.sector',
        'targetUser',
      ],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findReceived(
    targetUserId: string,
    dto: ListCollaborationRequestsDto,
  ): Promise<PaginatedResult<CollaborationRequest>> {
    const { page = 1, limit = 20 } = dto;
    const [data, total] = await this.requestRepository.findAndCount({
      where: { targetUserId },
      relations: [
        'requesterIntake',
        'requesterIntake.intakeSectors',
        'requesterIntake.intakeSectors.sector',
        'targetIntake',
        'targetIntake.intakeSectors',
        'targetIntake.intakeSectors.sector',
        'requesterUser',
      ],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOneForUser(
    requestId: string,
    userId: string,
  ): Promise<CollaborationRequest> {
    const request = await this.findOneWithRelations(requestId);

    if (request.requesterUserId !== userId && request.targetUserId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return request;
  }

  // ─── Admin ────────────────────────────────────────────────────────────────

  async findAllAdmin(
    dto: ListCollaborationRequestsDto,
  ): Promise<PaginatedResult<CollaborationRequest>> {
    const { page = 1, limit = 20 } = dto;
    const [data, total] = await this.requestRepository.findAndCount({
      relations: [
        'requesterIntake',
        'targetIntake',
        'requesterUser',
        'targetUser',
      ],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findByUserIdAdmin(userId: string): Promise<{
    data: CollaborationHistoryItem[];
    total: number;
  }> {
    const requests = await this.requestRepository.find({
      where: [{ requesterUserId: userId }, { targetUserId: userId }],
      relations: [
        'requesterIntake',
        'targetIntake',
        'requesterUser',
        'targetUser',
      ],
      order: { createdAt: 'DESC' },
    });

    const data: CollaborationHistoryItem[] = requests.map((r) => {
      const isSender = r.requesterUserId === userId;
      const counterpart = isSender ? r.targetUser : r.requesterUser;
      const relatedIntake = isSender ? r.targetIntake : r.requesterIntake;
      return {
        id: r.id,
        direction: isSender ? 'sent' : 'received',
        status: r.status,
        counterpartName:
          [counterpart?.firstName, counterpart?.lastName]
            .filter(Boolean)
            .join(' ') ||
          counterpart?.email ||
          '—',
        counterpartEmail: counterpart?.email ?? '—',
        intakeTitle:
          relatedIntake?.aiProcessTitle ?? relatedIntake?.title ?? '—',
        intakeType: relatedIntake?.type ?? 'ip',
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      };
    });

    return { data, total: data.length };
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private async findOneOrFail(id: string): Promise<CollaborationRequest> {
    const request = await this.requestRepository.findOne({ where: { id } });
    if (!request) {
      throw new NotFoundException(`Collaboration request ${id} not found`);
    }
    return request;
  }

  private async findOneWithRelations(
    id: string,
  ): Promise<CollaborationRequest> {
    const request = await this.requestRepository.findOne({
      where: { id },
      relations: [
        'requesterIntake',
        'requesterIntake.intakeSectors',
        'requesterIntake.intakeSectors.sector',
        'targetIntake',
        'targetIntake.intakeSectors',
        'targetIntake.intakeSectors.sector',
        'requesterUser',
        'targetUser',
      ],
    });
    if (!request) {
      throw new NotFoundException(`Collaboration request ${id} not found`);
    }
    return request;
  }

  private async rejectOtherPendingRequests(
    targetIntakeId: string,
    acceptedRequestId: string,
  ): Promise<void> {
    await this.requestRepository.update(
      {
        targetIntakeId,
        status: CollaborationRequestStatus.PENDING,
        id: Not(acceptedRequestId),
      },
      { status: CollaborationRequestStatus.REJECTED },
    );
  }

  // ─── Notifications & Mail ─────────────────────────────────────────────────

  private async notifyCollaborationRequestReceived(
    request: CollaborationRequest,
    requesterIntake: Pick<Intake, 'id' | 'title' | 'aiProcessTitle'>,
    targetIntake: Pick<Intake, 'id' | 'title' | 'aiProcessTitle'>,
  ): Promise<void> {
    try {
      const requesterTitle =
        requesterIntake.aiProcessTitle ?? requesterIntake.title;
      const targetTitle = targetIntake.aiProcessTitle ?? targetIntake.title;

      await this.notificationsService.createCollaborationRequestNotification({
        userId: request.targetUserId,
        type: 'received',
        requestId: request.id,
        requesterIntakeTitle: requesterTitle,
        targetIntakeTitle: targetTitle,
      });

      // Load target user email for mail
      const targetUser = await this.userRepository.findOne({
        where: { id: request.targetUserId },
        select: ['id', 'email', 'firstName'],
      });
      if (targetUser) {
        await this.mailService.enqueueCollaborationRequestEmail({
          type: 'received',
          toEmail: targetUser.email,
          toFirstName: targetUser.firstName,
          requestId: request.id,
          requesterIntakeTitle: requesterTitle,
          targetIntakeTitle: targetTitle,
        });
      }
    } catch (err) {
      this.logger.error(
        `Failed to send collaboration request received notification: ${String(err)}`,
      );
    }
  }

  private async notifyCollaborationRequestAccepted(
    request: CollaborationRequest,
  ): Promise<void> {
    try {
      // Load intake titles
      const [requesterIntake, targetIntake] = await Promise.all([
        this.intakeRepository.findOne({
          where: { id: request.requesterIntakeId },
          select: ['id', 'title', 'aiProcessTitle'],
        }),
        this.intakeRepository.findOne({
          where: { id: request.targetIntakeId },
          select: ['id', 'title', 'aiProcessTitle'],
        }),
      ]);

      const requesterTitle =
        requesterIntake?.aiProcessTitle ?? requesterIntake?.title ?? '';
      const targetTitle =
        targetIntake?.aiProcessTitle ?? targetIntake?.title ?? '';

      await this.notificationsService.createCollaborationRequestNotification({
        userId: request.requesterUserId,
        type: 'accepted',
        requestId: request.id,
        requesterIntakeTitle: requesterTitle,
        targetIntakeTitle: targetTitle,
      });

      const requesterUser = await this.userRepository.findOne({
        where: { id: request.requesterUserId },
        select: ['id', 'email', 'firstName'],
      });
      if (requesterUser) {
        await this.mailService.enqueueCollaborationRequestEmail({
          type: 'accepted',
          toEmail: requesterUser.email,
          toFirstName: requesterUser.firstName,
          requestId: request.id,
          requesterIntakeTitle: requesterTitle,
          targetIntakeTitle: targetTitle,
        });
      }
    } catch (err) {
      this.logger.error(
        `Failed to send collaboration request accepted notification: ${String(err)}`,
      );
    }
  }

  private async notifyCollaborationRequestRejected(
    request: CollaborationRequest,
  ): Promise<void> {
    try {
      const [requesterIntake, targetIntake] = await Promise.all([
        this.intakeRepository.findOne({
          where: { id: request.requesterIntakeId },
          select: ['id', 'title', 'aiProcessTitle'],
        }),
        this.intakeRepository.findOne({
          where: { id: request.targetIntakeId },
          select: ['id', 'title', 'aiProcessTitle'],
        }),
      ]);

      const requesterTitle =
        requesterIntake?.aiProcessTitle ?? requesterIntake?.title ?? '';
      const targetTitle =
        targetIntake?.aiProcessTitle ?? targetIntake?.title ?? '';

      await this.notificationsService.createCollaborationRequestNotification({
        userId: request.requesterUserId,
        type: 'rejected',
        requestId: request.id,
        requesterIntakeTitle: requesterTitle,
        targetIntakeTitle: targetTitle,
      });

      const requesterUser = await this.userRepository.findOne({
        where: { id: request.requesterUserId },
        select: ['id', 'email', 'firstName'],
      });
      if (requesterUser) {
        await this.mailService.enqueueCollaborationRequestEmail({
          type: 'rejected',
          toEmail: requesterUser.email,
          toFirstName: requesterUser.firstName,
          requestId: request.id,
          requesterIntakeTitle: requesterTitle,
          targetIntakeTitle: targetTitle,
        });
      }
    } catch (err) {
      this.logger.error(
        `Failed to send collaboration request rejected notification: ${String(err)}`,
      );
    }
  }
}
