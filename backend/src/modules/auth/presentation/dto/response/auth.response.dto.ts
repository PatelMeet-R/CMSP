import { User } from 'src/modules/auth/domain/entities/user.entity';
import { UserResponseDto } from './user.response.dto';

export class AuthResponseDto {
  readonly user: UserResponseDto;
  readonly accessToken: string;
  readonly refreshToken: string;

  constructor(params: {
    user: User;
    accessToken: string;
    refreshToken: string;
  }) {
    this.user = new UserResponseDto(params.user);
    this.accessToken = params.accessToken;
    this.refreshToken = params.refreshToken;
  }
}
