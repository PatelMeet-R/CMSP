import { PersonalInfo } from '../../domain/entities/personal-info.entity';
import { PersonalInfoResponseDto } from '../../presentation/dto/response/pi.response.dto';

export class PersonalInfoMapperResponse {
  static toResponse(entity: PersonalInfo): PersonalInfoResponseDto {
    const dto = new PersonalInfoResponseDto();

    dto.id = entity.id;

    dto.firstName = entity.firstName;
    dto.lastName = entity.lastName;
    dto.enrollmentNumber = entity.enrollmentNumber;

    dto.fullName = entity.fullName;

    dto.gender = entity.gender?.value;

    dto.branch = entity.branch?.name;

    dto.joinedAcademicYear = entity.joinedAcademicYear?.value;

    dto.expectedGraduateYear = entity.expectedGraduateYear?.value;

    dto.primaryMobileNumber = entity.primaryMobileNumber;

    dto.secondaryMobileNumber = entity.secondaryMobileNumber;

    dto.city = entity.city;
    dto.state = entity.state;
    dto.country = entity.country;
    dto.postalCode = entity.postalCode;

    dto.createdAt = entity.createdAt;

    return dto;
  }
}
