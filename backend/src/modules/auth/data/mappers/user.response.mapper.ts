import { User } from '../../domain/entities/user.entity';
import { UserResponseDto } from '../../presentation/dto/response/user.response.dto';

export class UserMapper {
  static toResponseDto(
    user: User,
    permissions: string[] = [],
  ): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      role: user.role?.name || 'GUEST',
      branchId: user.personalInfo?.branch?.id ?? null,
      isEmailVerified: user.isEmailVerified,
      permissions: permissions,
      mustChangePassword: user.mustChangePassword,
      status: user.personalInfo?.userAccountStatus?.key,
    };
  }
}
