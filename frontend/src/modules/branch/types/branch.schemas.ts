import { z } from "zod";

export const branchBaseSchema = z.object({
  name: z.string().min(2, "Branch name must be at least 2 characters"),
  code: z.string().min(2, "Branch code must be at least 2 characters"),
});

// Create & Update Schemas
export const createBranchSchema = branchBaseSchema;
export const updateBranchSchema = branchBaseSchema.partial();

// Inferred Types
export type CreateBranchPayload = z.infer<typeof createBranchSchema>;
export type UpdateBranchPayload = z.infer<typeof updateBranchSchema>;

// Response Type
export type Branch = {
  id: string;
  name: string;
  code: string;
};
