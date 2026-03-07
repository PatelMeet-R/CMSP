import { SetMetadata } from '@nestjs/common';

// --> unique identifier for storing and retriving role requirements as metadata on route handlers
export const ROLES_KEY = 'roles';

// --> roles decorator marks the routes with roles that are allowed to access them
// --> roles guard will later reads this metadata to check if the user has permission

export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
