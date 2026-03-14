import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ProfessorSubMappingRepository } from '../../data/repositories/professor-subject-mapping-repository';
import { AssignSubjectDto } from '../../presentation/dto/request/professor-subjects.request.dto';
import { AssignSubjectMapper } from '../../data/mappers/subject-assign.mapper';
import { ERRORMESSAGE } from 'src/common/constants/error.message';
import { SubjectService } from './subject.service';
import { AuthService } from 'src/modules/auth/domain/services/auth.service';
import { EnumService } from 'src/modules/enums/domain/enums.service';

@Injectable()
export class ProfessorSubMappingService {
  constructor(
    private readonly subjectService: SubjectService,
    private readonly authService: AuthService,
    private readonly enumService: EnumService,
    private professorSubjectRepo: ProfessorSubMappingRepository,
  ) {}

  async assignSubject(dto: AssignSubjectDto, assignedById: number) {
    const [professor, subject, semester, academicYear, assignedBy] =
      await Promise.all([
        this.authService.getUserByIdWithPersonalInfo(dto.professorId),
        this.subjectService.getSubjectById(dto.subjectId),
        this.enumService.getEnumValueById(dto.semesterId),
        this.enumService.getEnumValueById(dto.academicYearId),
        this.authService.getUserByIdWithPersonalInfo(assignedById),
      ]);

    if (!professor || !subject || !semester || !academicYear) {
      throw new ConflictException(ERRORMESSAGE.INVALID_REQUEST);
    }

    if (!assignedBy) {
      throw new UnauthorizedException(
        `${ERRORMESSAGE.USER_NOT_AUTHENTICATED} or ${ERRORMESSAGE.INVALID_TOKEN}`,
      );
    }

    const existing = await this.professorSubjectRepo.findExisting(
      dto.professorId,
      dto.subjectId,
      dto.semesterId,
      dto.academicYearId,
    );

    if (existing) {
      throw new ConflictException(ERRORMESSAGE.SUBJECT_ALREADY_ASSIGNED);
    }

    const entity = AssignSubjectMapper.toEntity(dto, assignedBy);

    const saved = await this.professorSubjectRepo.assignSubject(entity);
    const result = await this.professorSubjectRepo.findSubjectByIdWithRelations(
      saved.id,
    );
    return AssignSubjectMapper.toResponse(result!);
  }

  async getSubjectsByProfessor(professorId: number) {
    const data =
      await this.professorSubjectRepo.findSubjectByProfessorId(professorId);

    return data.map((d) => AssignSubjectMapper.toResponseProfessorSubjects(d));
  }
  async getAllAssignSubjectDetails() {
    const data = await this.professorSubjectRepo.findAllAssignSubjectDetails();
    return data.map((d) => AssignSubjectMapper.toResponseProfessorSubjects(d));
  }
}
