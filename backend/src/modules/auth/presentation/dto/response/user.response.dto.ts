export class UserResponseDto {
  readonly id: string;
  readonly email: string;
  readonly role: string;
  readonly isEmailVerified: boolean;
  readonly branchId: string | null;
  readonly permissions: string[];
  readonly mustChangePassword: boolean;
  readonly status: string;
}
