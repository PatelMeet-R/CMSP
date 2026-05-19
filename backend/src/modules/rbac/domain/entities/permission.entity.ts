import { Column, Entity, Index } from 'typeorm';
import { UuidBaseEntity } from 'src/core/base.entity';

@Entity('permissions')
@Index(['resource', 'action'], { unique: true })
export class Permission extends UuidBaseEntity {
  @Column({ length: 50 })
  resource: string;

  @Column({ length: 50 })
  action: string;

  @Column({ unique: true, length: 100 })
  slug: string; // "resource:action" e.g. "assignment:create"

  @Column({ nullable: true, length: 255 })
  description: string;
}
