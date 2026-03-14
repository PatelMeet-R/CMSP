import { SubjectResponseDto } from '../../presentation/dto/response/subject.response.dto';
import { UpdateSubjectDto } from '../../presentation/dto/request/subject-update.request.dto';
import { EnumValue } from 'src/modules/enums/domain/entities/enumValue.entity';
import { Branch } from 'src/modules/branch/domain/entities/branch.entity';
import { CreateSubjectDto } from '../../presentation/dto/request/subject-register.request.dto';
import { Subject } from '../../domain/entities/subject.entity';

export class SubjectMapper {
  static updateEntity(
    subject: Subject,
    dto: UpdateSubjectDto,
    branch: Branch,
    semester: EnumValue,
  ): Subject {
    subject.name = dto.name!;
    subject.code = dto.code!;
    subject.branch = branch;
    subject.semester = semester;

    return subject;
  }

  static toResponse(subject: Subject): SubjectResponseDto {
    return {
      id: subject.id,
      name: subject.name,
      code: subject.code,
      branch: subject.branch!.name,
      semester: subject.semester!.value,
    };
  }
  static toEntity(
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
}
