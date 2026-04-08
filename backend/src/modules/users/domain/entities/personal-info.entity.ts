import { IsOptional } from 'class-validator';
import { AuditableEntity } from 'src/core/base.entity';
import { User } from 'src/modules/auth/domain/entities/user.entity';
import { Branch } from 'src/modules/branch/domain/entities/branch.entity';
import { EnumValue } from 'src/modules/enums/domain/entities/enumValue.entity';
import { File } from 'src/modules/file-upload/domain/entity/file.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';

@Entity('personal_info')
export class PersonalInfo extends AuditableEntity {
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @OneToOne(() => File, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'profileImageId' })
  profileImage: File | null;

  @Index()
  @Column({ length: 20, unique: true, nullable: true })
  enrollmentNumber: string;

  @Index()
  @Column({ length: 50 })
  firstName: string;

  @Index()
  @Column({ length: 50 })
  lastName: string;

  @ManyToOne(() => EnumValue, { eager: true })
  @JoinColumn({ name: 'genderId' })
  gender: EnumValue;

  @ManyToOne(() => Branch, { nullable: true })
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

  @ManyToOne(() => EnumValue, { eager: true })
  @JoinColumn({ name: 'joinedYearId' })
  joinedAcademicYear: EnumValue;

  @ManyToOne(() => EnumValue, { eager: true })
  @JoinColumn({ name: 'expectedGraduateYearId' })
  expectedGraduateYear: EnumValue;

  @Column({ length: 10 })
  primaryMobileNumber: string;

  @Column({ type: 'varchar', nullable: true, length: 10 }) //optional one
  secondaryMobileNumber?: string | null;

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

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
