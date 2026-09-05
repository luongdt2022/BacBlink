import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Intake } from './intake.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => Intake, (intake) => intake.category)
  intakes: Intake[];
}
