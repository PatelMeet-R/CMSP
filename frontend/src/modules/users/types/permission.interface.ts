import * as z from "zod";

/** A single permission entry in the matrix */

export interface PermissionMatrixItem {
  slug: string;
  isChecked: boolean;
  currentState: "grant" | "revoke" | "default";
}

/** Target user info returned with the matrix */
export interface PermissionMatrixTargetUser {
  id: string;
  role: string;
  name: string;
}

/** Full response from GET /user-permissions/matrix/:id */
export interface PermissionMatrixResponse {
  targetUser: PermissionMatrixTargetUser;
  section1_baseRolePermissions: PermissionMatrixItem[];
  section2_extraAssignablePermissions: PermissionMatrixItem[];
}

/** Request body for PUT /user-permissions/bulk/:id */
export interface BulkPermissionOverride {
  permissionSlug: string;
  state: "grant" | "revoke" | "default";
}

export interface BulkManagePermissionPayload {
  reason: string;
  overrides: BulkPermissionOverride[];
}

export interface LocalOverride {
  slug: string;
  state: "grant" | "revoke" | "default";
}

export const formSchema = z.object({
  reason: z
    .string()
    .min(10, "Justification must be at least 10 characters long.")
    .max(255, "Justification is too long."),
});

export type PermissionSaveFormValues = z.infer<typeof formSchema>;

export interface PermissionSaveProps {
  personalInfoId: string;
  localOverrides: Map<string, LocalOverride>;
  onClose: () => void;
  onSuccessCallback: () => void;
}

export interface PermissionSectionProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  groups: Map<string, PermissionMatrixItem[]>;
  isBaseSection: boolean;
  getChecked: (item: PermissionMatrixItem) => boolean;
  onToggle: (
    item: PermissionMatrixItem,
    isBaseSection: boolean,
    newChecked: boolean,
  ) => void;
  localOverrides: Map<string, LocalOverride>;
  accentColor: "blue" | "emerald";
}
