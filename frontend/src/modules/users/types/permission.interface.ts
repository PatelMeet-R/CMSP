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
