import { PartialType } from '@nestjs/swagger';
import { CreateSubjectDto } from './subject-register.request.dto';

export class UpdateSubjectDto extends PartialType(CreateSubjectDto) {}
