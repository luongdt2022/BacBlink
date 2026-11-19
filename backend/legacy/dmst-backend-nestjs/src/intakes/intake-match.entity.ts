import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Intake } from './intake.entity';

@Entity('intake_matches')
export class IntakeMatch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'ip_intake_id', type: 'uuid' })
  ipIntakeId: string;

  @Column({ name: 'challenge_intake_id', type: 'uuid' })
  challengeIntakeId: string;

  @Column({ type: 'float' })
  score: number;

  @Column({ name: 'matched_chunk', type: 'text' })
  matchedChunk: string;

  @Column({ name: 'chunk_index', type: 'int', default: 0 })
  chunkIndex: number;

  @CreateDateColumn({ name: 'computed_at' })
  computedAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Intake, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'ip_intake_id' })
  ipIntake: Intake;

  @ManyToOne(() => Intake, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'challenge_intake_id' })
  challengeIntake: Intake;
}
