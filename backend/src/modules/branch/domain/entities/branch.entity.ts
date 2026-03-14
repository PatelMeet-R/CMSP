import { Column, Entity } from 'typeorm';
import { BaseEntity } from 'src/core/base.entity';

@Entity('branch')
export class Branch extends BaseEntity {
  @Column({ unique: true })
  code: string;

  @Column({ unique: true })
  name: string;
}
