export interface PermissionUpdateDetail {
  permissionSlug: string;
  state: "grant" | "revoke" | "default";
}

export interface PermissionAuditLog {
  id: string;
  action: string;
  createdAt: string;
  actor: {
    id: string;
    email: string;
    personalInfo?: {
      firstName: string;
      lastName: string;
    };
  };
  details: {
    reason: string;
    updates: PermissionUpdateDetail[];
  };
}
