import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * @Permissions('assignment:create', 'assignment:update')
 * Marks a route with the required permissions.
 * PermissionsGuard reads this metadata to enforce access control.
 */
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
