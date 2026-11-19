import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum StoryType {
  SUCCESS = 'success',
  FAILURE = 'failure',
}

export enum StoryStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

@Entity('stories')
export class Story {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'enum', enum: StoryType })
  type: StoryType;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  lesson: string | null;

  @Column({ type: 'enum', enum: StoryStatus, default: StoryStatus.DRAFT })
  status: StoryStatus;

  @Column({ name: 'is_hidden', type: 'boolean', default: false })
  isHidden: boolean;

  @Column({ name: 'author_id' })
  authorId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
