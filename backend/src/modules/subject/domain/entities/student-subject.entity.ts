import { User } from 'src/modules/auth/domain/entities/user.entity';
import { EnumValue } from 'src/modules/enums/domain/entities/enumValue.entity';
import { Subject } from 'src/modules/subject/domain/entities/subject.entity';
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  Unique,
} from 'typeorm';

@Entity('student_subjects')
@Unique(['student', 'subject', 'semester', 'academicYear'])
export class StudentSubject extends BaseEntity {
  @Index()
  @ManyToOne(() => User)
  student: User;

  @ManyToOne(() => Subject)
  subject: Subject;

  @ManyToOne(() => EnumValue, { eager: true })
  @JoinColumn({ name: 'semesterId' })
  semester: EnumValue;

  @Column()
  academicYear: string;
}
