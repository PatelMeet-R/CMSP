import type { PaginationMeta } from "@/components/custom/dashboard/DataTablePagination";
import { z } from "zod";

export interface ProfileResponse {
  id: string;
  personalInfoId?: string;
  fullName: string;
  firstName: string;
  lastName: string;
  enrollmentNumber: string;

  profileImageUrl: string | null;
  email?: string;

  gender: string | null;
  genderId?: string;

  branch: string | null;
  branchId?: string;

  joinedYear: string | null;
  joinedAcademicYearId?: string;

  gradYear: string | null;
  expectedGraduateYearId?: string;

  accountStatus: string | null;
  userAccountStatusId?: string;

  address: {
    city: string;
    state: string;
    country: string;
    postalCode?: string;
  };

  primaryMobileNumber?: string;
  secondaryMobileNumber?: string;

  createdAt: string;
}

export interface FetchUsersQueryParams {
  page: number;
  limit: number;
  search?: string;
  roleId?: string;
  branchId?: string;
  genderId?: string;
}

export interface PaginatedUserResponse {
  items: any[];
  meta: PaginationMeta;
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
  genderId: z.string().optional(),
  joinedAcademicYearId: z.string().optional(),

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
  branchId: z.string().optional(),
  expectedGraduateYearId: z.string().optional(),
  userAccountStatusId: z.string().optional(),
});

export const staffRegisterSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  branchId: z
    .string({ message: "Please select a branch" })
    .min(1, "Branch is required"),
  roleId: z
    .string({ message: "Please select a role" })
    .min(1, "Role is required"),
  designation: z
    .string()
    .min(2, "Designation is required (e.g., Assistant Professor)"),
  officeLocation: z
    .string()
    .min(2, "Office Location is required (e.g., Room 402)"),
  joiningDate: z
    .string()
    .optional()
    .refine(
      (dateString) => {
        if (!dateString) return true;

        const selectedDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return selectedDate >= today;
      },
      { message: "Joining date cannot be in the past" },
    ),
});

export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;
export type StaffRegisterFormValues = z.infer<typeof staffRegisterSchema>;
