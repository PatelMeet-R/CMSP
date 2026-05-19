import { UuidBaseEntity } from 'src/core/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('enum_types')
export class EnumType extends UuidBaseEntity {
  @Column({ unique: true })
  type: string;
}
