export interface AccessTokenPayload {
  sub: number;
  email: string;
  role: string;
  branchId?: number;
}

export interface RefreshTokenPayload {
  sub: number;
}
