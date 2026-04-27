import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
} from 'typeorm';
import { UuidBaseEntity } from 'src/core/base.entity';
import { Permission } from './permission.entity';

@Entity('roles')
export class Role extends UuidBaseEntity {
  @Column({ unique: true, length: 50 })
  name: string; // e.g. "SUPER_ADMIN", "HOD", "PROFESSOR"

  @Column({ nullable: true, length: 255 })
  description: string;

  @Column({ default: false })
  isSystem: boolean; // System roles (SUPER_ADMIN, HOD, etc.) cannot be deleted

  @ManyToMany(() => Permission, { eager: true })
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'roleId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permissionId', referencedColumnName: 'id' },
  })
  permissions: Permission[];
}
