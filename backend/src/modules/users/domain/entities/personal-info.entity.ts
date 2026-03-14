import { AuditableEntity } from 'src/core/base.entity';
import { User } from 'src/modules/auth/domain/entities/user.entity';
import { Branch } from 'src/modules/branch/domain/entities/branch.entity';
import { EnumValue } from 'src/modules/enums/domain/entities/enumValue.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

@Entity('personal_info')
export class PersonalInfo extends AuditableEntity {
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column({ unique: true })
  enrollmentNumber: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @ManyToOne(() => EnumValue, { eager: true })
  @JoinColumn({ name: 'genderId' })
  gender: EnumValue;

  @ManyToOne(() => Branch, { nullable: false })
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

  @ManyToOne(() => EnumValue, { eager: true })
  @JoinColumn({ name: 'joinedYearId' })
  joinedAcademicYear: EnumValue;

  @ManyToOne(() => EnumValue, { eager: true })
  @JoinColumn({ name: 'expectedGraduateYearId' })
  expectedGraduateYear: EnumValue;

  @Column({ length: 10 }) //max-min lenght is 10
  primaryMobileNumber: string;

  @Column({ nullable: true, length: 10 }) //optional one
  secondaryMobileNumber?: string;

  // account status
  @ManyToOne(() => EnumValue, { eager: true })
  @JoinColumn({ name: 'userAccountStatusId' })
  userAccountStatus: EnumValue;

  //address
  @Column()
  city: string;
  @Column()
  state: string;
  @Column()
  country: string;
  @Column({ length: 6 })
  postalCode: string;
  entity: EnumValue;
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
