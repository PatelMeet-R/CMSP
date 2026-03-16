// import { User } from 'src/modules/auth/domain/entities/user.entity';
// import { UserResponseDto } from './user.response.dto';

import { User } from '../../domain/entities/user.entity';
import { AuthResponseDto } from '../../presentation/dto/response/auth.response.dto';
import { UserMapper } from './user.response.mapper';

export class AuthMapper {
  static toAuthResponse(
    user: User,
    accessToken: string,
    refreshToken: string,
  ): AuthResponseDto {
    return {
      user: UserMapper.toResponseDto(user),
      accessToken,
      refreshToken,
    };
  }
}
