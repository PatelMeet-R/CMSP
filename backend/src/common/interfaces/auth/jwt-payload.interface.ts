export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: string;
  branchId?: string;
}

export interface RefreshTokenPayload {
  sub: string;
}
