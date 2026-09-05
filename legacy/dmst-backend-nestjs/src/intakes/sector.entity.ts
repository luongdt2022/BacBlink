import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { IntakeSector } from './intake-sector.entity';

@Entity('sectors')
export class Sector {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => IntakeSector, (intakeSector) => intakeSector.sector)
  intakeSectors: IntakeSector[];
}
