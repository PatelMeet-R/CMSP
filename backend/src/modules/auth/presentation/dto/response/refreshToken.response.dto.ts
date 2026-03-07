export class RefreshTokenResponseDto {
  accessToken: string;
  refreshToken: string;
  constructor(partial: Partial<RefreshTokenResponseDto>) {
    Object.assign(this, partial);
  }
}
