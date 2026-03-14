export class PersonalInfoResponseDto {
  id: number;
  firstName: string;
  lastName: string;
  gender: string;
  joinedAcademicYear: string;
  expectedGraduateYear: string;
  primaryMobileNumber: string;
  secondaryMobileNumber?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  createdAt: Date;
  createdBy?: number;
  updatedBy?: number;
  fullName?: string;
  branch: string;
}
