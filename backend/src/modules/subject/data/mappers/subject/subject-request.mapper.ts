import { Branch } from 'src/modules/branch/domain/entities/branch.entity';
import { EnumValue } from 'src/modules/enums/domain/entities/enumValue.entity';
import { Subject } from 'src/modules/subject/domain/entities/subject.entity';
import  { CreateSubjectDto } from 'src/modules/subject/presentation/dto/request/subject-register.request.dto';
import  { UpdateSubjectDto } from 'src/modules/subject/presentation/dto/request/subject-update.request.dto';

export class SubjectRequestMapper {
  static toCreateEntity(
    dto: CreateSubjectDto,
    branch: Branch,
    semester: EnumValue,
  ): Subject {
    const subject = new Subject();
    subject.name = dto.name;
    subject.code = dto.code;
    subject.branch = branch;
    subject.semester = semester;
    return subject;
  }

  static toUpdateEntity(
    subject: Subject,
    dto: UpdateSubjectDto,
    branch: Branch,
    semester: EnumValue,
  ): Subject {
    if (dto.name) subject.name = dto.name;
    if (dto.code) subject.code = dto.code;
    if (branch) subject.branch = branch;
    if (semester) subject.semester = semester;
    return subject;
  }
}
