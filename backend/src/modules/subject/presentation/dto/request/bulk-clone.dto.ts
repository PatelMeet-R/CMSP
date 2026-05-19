import { IsArray, IsNotEmpty, IsUUID, ArrayNotEmpty } from 'class-validator';

export class BulkCloneAssignmentsDto {
  @IsUUID()
  @IsNotEmpty()
  sourceAcademicYearId: string; // The year we are copying FROM

  @IsUUID()
  @IsNotEmpty()
  targetAcademicYearId: string; // The year we are copying TO

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  mappingIdsToClone: string[]; // Array of the soft-deleted assignment IDs they selected
}
