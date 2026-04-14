import { AuditableEntity } from 'src/core/base.entity';
import { EnumValue } from 'src/modules/enums/domain/entities/enumValue.entity';
import { PersonalInfo } from 'src/modules/users/domain/entities/personal-info.entity';
import { StaffProfile } from 'src/modules/users/domain/entities/staff-profile.entity';

import { Column, Entity, Index, ManyToOne, OneToOne } from 'typeorm';

@Entity('users')
export class User extends AuditableEntity {
  @Column({ unique: true })
  @Index()
  email: string;

  @Column()
  password: string;

  @ManyToOne(() => EnumValue, { eager: true }) //Why eager: true? --> because TypeORM automatically loads role.
  role: EnumValue;

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
}
