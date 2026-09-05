import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';

@Entity('password_reset_tokens')
export class PasswordResetToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  @Index('IDX_password_reset_tokens_user_id')
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', unique: true, length: 255 })
  token: string;

  @Column({ name: 'expires_at', type: 'timestamp' })
  @Index('IDX_password_reset_tokens_expires_at')
  expiresAt: Date;

  @Column({ name: 'consumed_at', type: 'timestamp', nullable: true })
  consumedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
