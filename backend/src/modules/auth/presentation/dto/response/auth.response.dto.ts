import { User } from 'src/modules/auth/domain/entities/user.entity';
import { UserResponseDto } from './user.response.dto';
import { UserMapper } from 'src/modules/auth/data/mappers/user.response.mapper';

export class AuthResponseDto {
  readonly user: UserResponseDto;
  readonly accessToken: string;
  readonly refreshToken: string;

  constructor(params: {
    user: User;
    permissionSlugs: string[];
    accessToken: string;
    refreshToken: string;
  }) {
    this.user = UserMapper.toResponseDto(
      params.user,
      params.permissionSlugs
    );
    this.accessToken = params.accessToken;
    this.refreshToken = params.refreshToken;
  }
}
