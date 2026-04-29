import { z } from "zod";

export const RoleSchema = z.object({
  id: z.string(), // V2 UUID
  name: z.string(), // e.g., "SUPER_ADMIN", "HOD"
  description: z.string().nullable().optional(),
  isSystem: z.boolean(),
});

export type RoleResponse = z.infer<typeof RoleSchema>;
