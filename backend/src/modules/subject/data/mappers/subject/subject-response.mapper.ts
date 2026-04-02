import type { Subject } from 'src/modules/subject/domain/entities/subject.entity';

export class SubjectResponseMapper {
  static toResponse(entity: Subject) {
    return {
      id: entity.id,
      code: entity.code,
      name: entity.name,
      branch: entity.branch?.name || null,
      semester: entity.semester?.key || null,
      createdAt: entity.createdAt,
    };
  }

  static toPaginatedResponse(items: Subject[]) {
    return items.map((item) => this.toResponse(item));
  }
}
