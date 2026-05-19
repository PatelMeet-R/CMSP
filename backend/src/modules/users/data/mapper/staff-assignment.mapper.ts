import { PersonalInfo } from '../../domain/entities/personal-info.entity';

export class StaffAssignmentMapper {
  static toPaginatedSearchResponse(items: PersonalInfo[]) {
    return items.map((entity) => ({
      id: entity.id,
      userId: entity.user?.id || null,
      firstName: entity.firstName,
      lastName: entity.lastName,
      fullName: `${entity.firstName} ${entity.lastName}`,
      roleKey: entity.user?.role?.name || null,
    }));
  }
}
