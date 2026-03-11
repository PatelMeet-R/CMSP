import { User } from 'src/modules/auth/domain/entities/user.entity';

export class UserResponseDto {
  readonly id: number;
  readonly email: string;
  readonly role: string;
  readonly isEmailVerified: boolean;
  readonly branchId: number | null;

  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
    this.role = user.role?.key;
    this.isEmailVerified = user.isEmailVerified;
    this.branchId = user.branch.id ?? null;
  }
}
