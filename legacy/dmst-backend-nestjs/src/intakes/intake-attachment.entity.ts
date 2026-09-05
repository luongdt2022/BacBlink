import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Intake } from './intake.entity';

export enum IntakeAttachmentType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
  PROFILE_PICTURE = 'profile_picture',
}

export enum ConfidentialLevel {
  LEVEL_2 = 'level2',
  LEVEL_3 = 'level3',
}

@Entity('intake_attachments')
export class IntakeAttachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'intake_id', type: 'uuid' })
  intakeId: string;

  @ManyToOne(() => Intake, (intake) => intake.attachments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'intake_id' })
  intake: Intake;

  @Column({ name: 'file_name', type: 'varchar', length: 255 })
  fileName: string;

  @Column({ name: 'file_path', type: 'varchar', length: 500 })
  filePath: string;

  @Column({
    name: 'file_type',
    type: 'enum',
    enum: IntakeAttachmentType,
  })
  fileType: IntakeAttachmentType;

  @Column({ name: 'mime_type', type: 'varchar', length: 100, nullable: true })
  mimeType: string | null;

  @Column({ name: 'file_size', type: 'bigint', nullable: true })
  fileSize: number | null;

  @Column({
    name: 'confidential_level',
    type: 'enum',
    enum: ConfidentialLevel,
    nullable: true,
    default: null,
  })
  confidentialLevel: ConfidentialLevel | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
