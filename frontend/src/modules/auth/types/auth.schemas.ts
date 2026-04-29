import * as z from "zod";

// =============================================
//  V2 Auth Schemas — Matches Backend UserResponseDto
// =============================================

export const LoginInputSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const SignupInputSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(2, "first name is too short"),
  lastName: z.string().min(2, "last name is too short"),
  enrollmentNumber: z.string().min(5, "Enrollment number is required"),
  branchId: z.number().int().positive("please select a branch"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const ForgetPasswordInputSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordInputSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// =============================================
//  V2 User Schema — Matches UserResponseDto from backend
//  Backend sends: { id, email, role (string), branchId,
//  isEmailVerified, permissions[], mustChangePassword, status }
// =============================================

/** Account statuses matching backend ENUM_VALUES.USER_ACC_STATUS */
export const USER_STATUS = {
  ACTIVE: "ACTIVE",
  PENDING: "PENDING",
  BLOCKED: "BLOCKED",
  REJECTED: "REJECTED",
  INACTIVE: "INACTIVE",
  GRADUATED: "GRADUATED",
} as const;

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

export const UserSchema = z.object({
  id: z.string(), // V2: UUID string, not number
  email: z.string().email(),
  role: z.string(), // V2: role name string (e.g. "SUPER_ADMIN", "HOD")
  branchId: z.string().nullable(), // V2: UUID string, not number
  isEmailVerified: z.boolean(),
  permissions: z.array(z.string()), // V2: permission slugs ["assignment:create", ...]
  mustChangePassword: z.boolean(),
  status: z.string(), // V2: "ACTIVE", "INACTIVE", "BLOCKED", etc.
});

export const LoginResponseSchema = z.object({
  message: z.string(),
  data: UserSchema, // V2: No accessToken/refreshToken in body — they're in HttpOnly cookies
});

//  Export the TypeScript types
export type User = z.infer<typeof UserSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type LoginInput = z.infer<typeof LoginInputSchema>;
export type SignupInput = z.infer<typeof SignupInputSchema>;
export type ForgetPasswordInput = z.infer<typeof ForgetPasswordInputSchema>;
export type resetPasswordInput = z.infer<typeof resetPasswordInputSchema>;
