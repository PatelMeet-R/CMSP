import { AuditableEntity } from 'src/core/base.entity';
import { User } from 'src/modules/auth/domain/entities/user.entity';
import { EnumValue } from 'src/modules/enums/domain/entities/enumValue.entity';
import { Subject } from 'src/modules/subject/domain/entities/subject.entity';
import { Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

@Index(
  'IDX_UNIQUE_ACTIVE_ASSIGNMENT',
  ['professor', 'subject', 'semester', 'academicYear'],
  {
    unique: true,
    where: '"deletedAt" IS NULL',
  },
)
@Entity('professor_subjects')
export class ProfessorSubMapping extends AuditableEntity {
  @ManyToOne(() => User)
  @JoinColumn({ name: 'professorId' })
  professor: User;

  @ManyToOne(() => Subject)
  @JoinColumn({ name: 'subjectId' })
  subject: Subject;

  @ManyToOne(() => EnumValue)
  @JoinColumn({ name: 'semesterId' })
  semester: EnumValue;

  @ManyToOne(() => EnumValue)
  @JoinColumn({ name: 'academicYearId' })
  academicYear: EnumValue;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assignedById' })
  assignedBy: User;
}
