import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('enum_types')
export class EnumType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  type: string;
}
