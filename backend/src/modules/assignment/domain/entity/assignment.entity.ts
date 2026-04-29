import { AuditableEntity } from 'src/core/base.entity';
import { Branch } from 'src/modules/branch/domain/entities/branch.entity';
import { EnumValue } from 'src/modules/enums/domain/entities/enumValue.entity';
// import { File } from 'src/modules/file-upload/domain/entity/file.entity';
import { File as FileEntity } from 'src/modules/file-upload/domain/entity/file.entity';
import { Subject } from 'src/modules/subject/domain/entities/subject.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('assignment')
export class Assignment extends AuditableEntity {
  @Column()
  title: string;

  @ManyToOne(() => Subject)
  @JoinColumn({ name: 'subjectId' })
  subject: Subject;

  @Column()
  description: string;
  @Column()
  dueDate: Date;

  @ManyToOne(() => EnumValue)
  @JoinColumn({ name: 'semesterId' })
  semester: EnumValue;

  @ManyToOne(() => Branch, { nullable: false })
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

  @ManyToOne(() => EnumValue)
  @JoinColumn({ name: 'academicYearId' })
  academicYear: EnumValue;

  @ManyToOne(() => FileEntity)
  @JoinColumn({ name: 'fileId' })
  attachment?: FileEntity;
}
