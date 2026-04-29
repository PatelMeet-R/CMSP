/**
 * Checks if a user's permissions array contains a specific permission
 * OR the god-mode wildcard (*:*).
 *
 * Use this instead of `permissions.includes('slug')` in service-layer
 * PBAC gates so that SUPER_ADMIN's wildcard is always honored.
 *
 * @example
 * if (hasPermission(currentUser.permissions, 'assignment:read')) { ... }
 */
export function hasPermission(
  permissions: string[] | undefined,
  required: string,
): boolean {
  if (!permissions || permissions.length === 0) return false;
  return permissions.includes('*:*') || permissions.includes(required);
}

/**
 * Checks if a user has ANY of the required permissions (OR logic)
 * OR the god-mode wildcard (*:*).
 *
 * @example
 * if (hasAnyPermission(currentUser.permissions, ['assignment:read', 'assignment:read-self'])) { ... }
 */
export function hasAnyPermission(
  permissions: string[] | undefined,
  required: string[],
): boolean {
  if (!permissions || permissions.length === 0) return false;
  if (permissions.includes('*:*')) return true;
  return required.some((perm) => permissions.includes(perm));
}

/**
 * Checks if a user is a Super Admin (has the god-mode wildcard).
 *
 * @example
 * if (isSuperAdmin(currentUser.permissions)) { ... }
 */
export function isSuperAdmin(permissions: string[] | undefined): boolean {
  return !!permissions && permissions.includes('*:*');
}
