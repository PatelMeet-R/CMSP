import { ROLES } from "@/core/Constants/enums/role-enum-value";
import * as z from "zod";

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

export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  role: z.enum(ROLES),
  branchId: z.number(),
  isEmailVerified: z.boolean(),
});

export const LoginResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    user: UserSchema,
    accessToken: z.string(),
    refreshToken: z.string(),
  }),
});

//  Export the TypeScript types
export type User = z.infer<typeof UserSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type LoginInput = z.infer<typeof LoginInputSchema>;
export type SignupInput = z.infer<typeof SignupInputSchema>;
export type ForgetPasswordInput = z.infer<typeof ForgetPasswordInputSchema>;
export type resetPasswordInput = z.infer<typeof resetPasswordInputSchema>;
