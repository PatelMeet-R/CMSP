import { AuditableEntity } from 'src/core/base.entity';
import { User } from 'src/modules/auth/domain/entities/user.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

@Entity('staff_profiles')
export class StaffProfile extends AuditableEntity {
  @OneToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', length: 100, nullable: true })
  designation: string; //   enum will be added here

  @Column({ type: 'varchar', length: 50, nullable: true })
  officeLocation: string;

  @Column({ type: 'date', nullable: true })
  joiningDate: Date;

  @Column({ type: 'int', default: 0 })
  maxSubjectWorkload: number;
}
