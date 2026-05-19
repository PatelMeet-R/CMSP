import { PartialType } from '@nestjs/swagger';
import { AssignSubjectDto } from './professor-subjects.request.dto';

export class UpdateAssignSubjectDto extends PartialType(AssignSubjectDto) {}
