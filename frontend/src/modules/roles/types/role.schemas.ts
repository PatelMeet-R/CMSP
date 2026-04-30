import { z } from "zod";

export const RoleSchema = z.object({
  id: z.string(), // V2 UUID
  name: z.string(), // e.g., "SUPER_ADMIN", "HOD"
  description: z.string().nullable().optional(),
  isSystem: z.boolean(),
});

export type RoleResponse = z.infer<typeof RoleSchema>;

export interface RolePermissionItem {
  id: string;
  slug: string;
  resource: string;
  action: string;
  isGranted: boolean;
}

export interface RolePermissionMatrixResponse {
  role: { id: string; name: string };
  permissions: RolePermissionItem[];
}
export interface RoleListItem {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
}
