import type { UserResponseDto } from 'src/modules/auth/presentation/dto/response/user.response.dto';

export class RefreshTokenResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserResponseDto;
  // constructor(partial: Partial<RefreshTokenResponseDto>) {
  //   Object.assign(this, partial);
  // }
}
