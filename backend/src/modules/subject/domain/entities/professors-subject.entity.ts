import { AuditableEntity } from 'src/core/base.entity';
import { User } from 'src/modules/auth/domain/entities/user.entity';
import { EnumValue } from 'src/modules/enums/domain/entities/enumValue.entity';
import { Subject } from 'src/modules/subject/domain/entities/subject.entity';
import { Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';

@Entity('professor_subjects')
@Unique(['professor', 'subject', 'semester', 'academicYear'])
export class ProfessorSubMapping extends AuditableEntity {
  @ManyToOne(() => User)
  @JoinColumn({ name: 'professorId' })
  professor: User;

  @ManyToOne(() => Subject)
  @JoinColumn({ name: 'subjectId' })
  subject: Subject;

  @ManyToOne(() => EnumValue, { eager: true })
  @JoinColumn({ name: 'semesterId' })
  semester: EnumValue;

  @ManyToOne(() => EnumValue, { eager: true })
  @JoinColumn({ name: 'academicYearId' })
  academicYear: EnumValue;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assignedById' })
  assignedBy: User;
}
