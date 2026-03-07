export interface AccessTokenPayload {
  sub: number;
  email: string;
  role: string;
}

export interface RefreshTokenPayload {
  sub: number;
}
