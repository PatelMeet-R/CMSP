import { User } from '../../domain/entities/user.entity';
import { UserResponseDto } from '../../presentation/dto/response/user.response.dto';

export class UserMapper {
  static toResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      role: user.role?.key,
      isEmailVerified: user.isEmailVerified,
    };
  }
}
