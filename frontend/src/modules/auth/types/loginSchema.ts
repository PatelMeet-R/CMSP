import { ROLES } from "@/core/Constants/enums/role-enum-value";
import * as z from "zod";

export const LoginInputSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type LoginInput = z.infer<typeof LoginInputSchema>;

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

// 3. Export the TypeScript types
export type User = z.infer<typeof UserSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
