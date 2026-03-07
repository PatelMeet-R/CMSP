import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { EnumType } from './enumType.entity';

@Entity('enum_values')
export class EnumValue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  key: string;

  @Column()
  value: string;

  @ManyToOne(() => EnumType)
  type: EnumType;
}
