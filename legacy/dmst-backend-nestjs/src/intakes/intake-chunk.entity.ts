import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Intake } from './intake.entity';

@Entity('intake_chunks')
export class IntakeChunk {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'intake_id', type: 'uuid' })
  intakeId: string;

  @ManyToOne(() => Intake, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'intake_id' })
  intake: Intake;

  @Column({ type: 'int' })
  index: number;

  @Column({ type: 'text' })
  text: string;

  /**
   * @deprecated Kept as the rollback path for MigrateSearchToPgvector.
   * Retrieval reads `emb vector(1024)` instead — see below.
   */
  @Column({ type: 'float', array: true, nullable: true })
  embedding: number[];

  // Deliberately NOT mapped by TypeORM:
  //   emb            vector(1024)      dense channel, HNSW
  //   emb_sparse     sparsevec(250002) BGE-M3 lexical weights
  //   tsv, tsv_ua    tsvector          generated, accented + unaccented
  //   searchable_ua  text              generated, for pg_trgm
  // TypeORM has no driver type for vector/sparsevec, and the generated columns
  // must never appear in an INSERT. PgVectorService writes and reads them with
  // raw SQL; the migration owns their DDL.

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
