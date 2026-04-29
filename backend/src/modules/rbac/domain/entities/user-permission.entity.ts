import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  Unique,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/modules/auth/domain/entities/user.entity';
import { Permission } from './permission.entity';

@Entity('user_permissions')
@Unique(['user', 'permission'])
export class UserPermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Permission, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'permissionId' })
  permission: Permission;

  @Column({ type: 'varchar', length: 10 })
  type: 'grant' | 'revoke';

  @CreateDateColumn()
  createdAt: Date;
}
