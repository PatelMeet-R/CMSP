import { BaseEntity } from 'src/core/base.entity';
import { Branch } from 'src/modules/branch/domain/entities/branch.entity';
import { EnumValue } from 'src/modules/enums/domain/entities/enumValue.entity';

import { Column, Entity, Index, ManyToOne } from 'typeorm';

@Entity('users')
export class User extends BaseEntity {
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

  @ManyToOne(() => Branch, { nullable: true })
  branch: Branch;
}
