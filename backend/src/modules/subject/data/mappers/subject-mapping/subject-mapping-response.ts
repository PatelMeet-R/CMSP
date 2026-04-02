import type { ProfessorSubMapping } from 'src/modules/subject/domain/entities/professors-subject.entity';

export class ProfessorMappingResponseMapper {
  static toResponse(entity: ProfessorSubMapping) {
    // Safely extract names just in case they are missing
    const profFirstName = entity.professor?.personalInfo?.firstName || '';
    const profLastName = entity.professor?.personalInfo?.lastName || '';

    const assignerFirstName = entity.assignedBy?.personalInfo?.firstName || '';
    const assignerLastName = entity.assignedBy?.personalInfo?.lastName || '';

    return {
      id: entity.id,
      createdAt: entity.createdAt,

      //  Professor Object
      professor: {
        id: entity.professor?.id,
        name: `${profFirstName} ${profLastName}`.trim(),
        email: entity.professor?.email,
        mobile: entity.professor?.personalInfo?.primaryMobileNumber || null,
      },

      //  Subject Object
      subject: {
        id: entity.subject?.id,
        code: entity.subject?.code,
        name: entity.subject?.name,
        branch: entity.subject?.branch?.name || null,
      },

      // Enums
      semester: entity.semester?.key || null,
      academicYear: entity.academicYear?.key || null,

      // Assigner
      assignedBy: `${assignerFirstName} ${assignerLastName}`.trim() || 'System',
    };
  }

  static toPaginatedResponse(items: ProfessorSubMapping[]) {
    return items.map((item) => this.toResponse(item));
  }
}
