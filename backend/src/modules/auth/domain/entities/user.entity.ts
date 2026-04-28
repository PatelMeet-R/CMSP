import { AuditableEntity } from 'src/core/base.entity';
import { Role } from 'src/modules/rbac/domain/entities/role.entity';
import { UserPermission } from 'src/modules/rbac/domain/entities/user-permission.entity';
import { PersonalInfo } from 'src/modules/users/domain/entities/personal-info.entity';
import { StaffProfile } from 'src/modules/users/domain/entities/staff-profile.entity';

import { Column, Entity, Index, ManyToOne, OneToMany, OneToOne } from 'typeorm';

@Entity('users')
export class User extends AuditableEntity {
  @Column({ unique: true })
  @Index()
  email: string;

  @Column()
  password: string;

  @ManyToOne(() => Role, { eager: true })
  role: Role;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ type: 'varchar', nullable: true })
  resetPasswordToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpires: Date | null;

  @OneToOne(() => PersonalInfo, (pi) => pi.user, { cascade: true })
  personalInfo: PersonalInfo;

  @Column({ default: false })
  mustChangePassword: boolean;

  @OneToOne(() => StaffProfile, (staffProfile) => staffProfile.user, {
    cascade: true,
    eager: false,
  })
  staffProfile: StaffProfile;

  @OneToMany(() => UserPermission, (userPermission) => userPermission.user)
  userPermissions: UserPermission[];

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date | null;
}
