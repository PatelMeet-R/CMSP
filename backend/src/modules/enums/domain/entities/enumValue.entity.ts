import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { EnumType } from './enumType.entity';
import { AuditableEntity } from 'src/core/base.entity';

@Entity('enum_values')
export class EnumValue extends AuditableEntity {
  @Column({ unique: true })
  key: string;

  @Column()
  value: string;

  @ManyToOne(() => EnumType)
  type: EnumType;
}
