import * as z from "zod";
export const SignupInputSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(2, "first name is too short"),
  lastName: z.string().min(2, "last name is too short"),
  enrollmentNumber: z.string().min(5, "Enrollment number is required"),
  branchId: z.number().int().positive("please select a branch"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type SignupInput = z.infer<typeof SignupInputSchema>;

export type Branch = {
  id: number;
  name: string;
  code: string;
};
