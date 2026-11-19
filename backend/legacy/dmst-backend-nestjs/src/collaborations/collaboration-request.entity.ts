import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Intake } from '../intakes/intake.entity';

export enum CollaborationRequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

@Entity('collaboration_requests')
export class CollaborationRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'requester_intake_id', type: 'uuid' })
  requesterIntakeId: string;

  @Column({ name: 'target_intake_id', type: 'uuid' })
  targetIntakeId: string;

  @Column({ name: 'requester_user_id', type: 'uuid' })
  requesterUserId: string;

  @Column({ name: 'target_user_id', type: 'uuid' })
  targetUserId: string;

  @Column({
    type: 'enum',
    enum: CollaborationRequestStatus,
    default: CollaborationRequestStatus.PENDING,
  })
  status: CollaborationRequestStatus;

  @Column({ type: 'text', nullable: true })
  message: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'requester_user_id' })
  requesterUser: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'target_user_id' })
  targetUser: User;

  @ManyToOne(() => Intake, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'requester_intake_id' })
  requesterIntake: Intake;

  @ManyToOne(() => Intake, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'target_intake_id' })
  targetIntake: Intake;
}
