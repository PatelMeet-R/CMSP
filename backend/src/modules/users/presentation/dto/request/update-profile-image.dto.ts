import { IsNumber, IsOptional } from 'class-validator';

export class UpdateProfileImageDto {
  @IsOptional()
  @IsNumber({}, { message: 'Profile Image ID must be a number' })
  profileImageId?: string | null;
}
