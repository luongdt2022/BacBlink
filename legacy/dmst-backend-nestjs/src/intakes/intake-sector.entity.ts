import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Intake } from './intake.entity';
import { Sector } from './sector.entity';

@Entity('intake_sectors')
export class IntakeSector {
  @PrimaryColumn({ name: 'intake_id', type: 'uuid' })
  intakeId: string;

  @PrimaryColumn({ name: 'sector_id', type: 'uuid' })
  sectorId: string;

  @ManyToOne(() => Intake, (intake) => intake.intakeSectors, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'intake_id' })
  intake: Intake;

  @ManyToOne(() => Sector, (sector) => sector.intakeSectors, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sector_id' })
  sector: Sector;
}
