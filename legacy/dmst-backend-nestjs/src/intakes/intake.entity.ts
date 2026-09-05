import {
  AfterLoad,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  IntakeAttachment,
  IntakeAttachmentType,
} from './intake-attachment.entity';
import { IntakeSector } from './intake-sector.entity';
import { Category } from './category.entity';
import { User } from '../users/user.entity';

export enum IntakeType {
  IP = 'ip',
  CHALLENGE = 'challenge',
}

export enum AiProcessingStatus {
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum AiChunkingStatus {
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum IntakeStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

@Entity('intakes')
export class Intake {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  aiProcessTitle: string | null;

  @Column({ type: 'text', nullable: true })
  content: string | null;

  @Column({ name: 'ai_processed_content', type: 'text', nullable: true })
  aiProcessedContent: string | null;

  @Column({
    type: 'enum',
    enum: IntakeStatus,
    default: IntakeStatus.DRAFT,
  })
  status: IntakeStatus;

  @Column({
    name: 'confidential_level_2_content',
    type: 'text',
    nullable: true,
  })
  confidentialLevel2Content: string | null;

  @Column({
    name: 'confidential_level_2_ai_processed_content',
    type: 'text',
    nullable: true,
  })
  confidentialLevel2AiProcessedContent: string | null;

  @Column({
    name: 'confidential_level_3_content',
    type: 'text',
    nullable: true,
  })
  confidentialLevel3Content: string | null;

  @Column({
    name: 'confidential_level_3_ai_processed_content',
    type: 'text',
    nullable: true,
  })
  confidentialLevel3AiProcessedContent: string | null;

  @Column({
    name: 'ai_processing_status',
    type: 'enum',
    enum: AiProcessingStatus,
    nullable: true,
  })
  aiProcessingStatus: AiProcessingStatus | null;

  @Column({
    name: 'ai_chunking_status',
    type: 'enum',
    enum: AiChunkingStatus,
    nullable: true,
  })
  aiChunkingStatus: AiChunkingStatus | null;

  @Column({
    type: 'enum',
    enum: IntakeType,
    default: IntakeType.IP,
  })
  type: IntakeType;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  @ManyToOne(() => User, (user) => user.intakes, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => IntakeAttachment, (attachment) => attachment.intake, {
    cascade: true,
    eager: true,
  })
  attachments: IntakeAttachment[];

  @OneToMany(() => IntakeSector, (intakeSector) => intakeSector.intake, {
    cascade: true,
  })
  intakeSectors: IntakeSector[];

  @ManyToOne(() => Category, (category) => category.intakes, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category: Category | null;

  profilePicUrl: string | null = null;

  @AfterLoad()
  computeProfilePicUrl() {
    const profilePic = this.attachments?.find(
      (a) => a.fileType === IntakeAttachmentType.PROFILE_PICTURE,
    );
    this.profilePicUrl = profilePic?.filePath ?? null;
  }
}
