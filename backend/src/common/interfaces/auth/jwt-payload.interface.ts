export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: string;
  branchId?: string;
  status?: string;
}

export interface RefreshTokenPayload {
  sub: string;
}
