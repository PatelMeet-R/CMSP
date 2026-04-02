import { z } from "zod";

export interface ProfileResponse {
  id: number;
  personalInfoId?: number;
  fullName: string;
  firstName: string;
  lastName: string;
  enrollmentNumber: string;

  gender: string | null;
  genderId?: number;

  branch: string | null;
  branchId?: number;

  joinedYear: string | null;
  joinedAcademicYearId?: number;

  expectedGraduationYear: string | null;
  expectedGraduateYearId?: number;

  accountStatus: string | null;
  userAccountStatusId?: number;

  address: {
    city: string;
    state: string;
    country: string;
    postalCode?: string;
  };

  primaryMobileNumber?: string;
  secondaryMobileNumber?: string;
}

export const updateProfileSchema = z.object({
  // --- BASIC FIELDS  ---
  primaryMobileNumber: z
    .string()
    .regex(/^\d{10}$/, "Mobile number must be exactly 10 digits")
    .optional()
    .or(z.literal("")),

  secondaryMobileNumber: z
    .string()
    .regex(/^\d{10}$/, "Mobile number must be exactly 10 digits")
    .optional()
    .or(z.literal("")),

  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),

  // Relational Basic Fields
  genderId: z.number().optional(),
  joinedAcademicYearId: z.number().optional(),

  // --- SENSITIVE FIELDS ---
  firstName: z
    .literal("")
    .or(z.string().min(2, "First name is too short"))
    .optional(),

  lastName: z
    .literal("")
    .or(z.string().min(2, "Last name is too short"))
    .optional(),

  enrollmentNumber: z.string().optional(),

  // Relational Sensitive Fields
  branchId: z.number().optional(),
  expectedGraduateYearId: z.number().optional(),
  userAccountStatusId: z.number().optional(),
});

export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;
