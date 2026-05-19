import { PartialType } from '@nestjs/swagger';
import { CreateAssignmentDto } from './create-assignment.request.dto';

export class UpdateAssignmentDto extends PartialType(CreateAssignmentDto) {}
