import { Column, Entity } from 'typeorm';
import { AuditableEntity, BaseEntity } from 'src/core/base.entity';

@Entity('branch')
export class Branch extends AuditableEntity {
  @Column({ unique: true })
  code: string;

  @Column({ unique: true })
  name: string;

  @Column({ default: false })
  isSystem: boolean;
}
