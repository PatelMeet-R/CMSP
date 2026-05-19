export enum PermissionOverrideState {
  GRANT = 'grant',
  REVOKE = 'revoke',
  DEFAULT = 'default',
}

export const AUDIT_ACTIONS = {
  BULK_UPDATE_PERMISSIONS: 'BULK_UPDATE_PERMISSIONS',
} as const;
