import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { IntakeType } from '../intakes/intake.entity';

export enum NotificationType {
  MATCH_FOUND = 'match_found',
  COLLABORATION_REQUEST_RECEIVED = 'collaboration_request_received',
  COLLABORATION_REQUEST_ACCEPTED = 'collaboration_request_accepted',
  COLLABORATION_REQUEST_REJECTED = 'collaboration_request_rejected',
}

export interface MatchFoundPayload {
  message: string;
  navigationPath: string;
  intakeId: string;
  intakeType: IntakeType;
  intakeTitle: string;
  matchCount: number;
}

export interface CollaborationRequestPayload {
  message: string;
  navigationPath: string;
  requestId: string;
  requesterIntakeTitle: string;
  targetIntakeTitle: string;
}

export type NotificationPayload =
  | MatchFoundPayload
  | CollaborationRequestPayload;

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({ type: 'jsonb' })
  payload: NotificationPayload;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
