import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PermissionComputeService } from 'src/modules/rbac/domain/services/permission-compute.service';
import { ERRORMESSAGE } from 'src/common/constants/error.message';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionComputeService: PermissionComputeService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Read required permissions from @Permissions() decorator
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no permissions defined on this route, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // 2. Get the authenticated user from request
    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException(ERRORMESSAGE.USER_NOT_AUTHENTICATED);
    }

    // 3. Compute the user's effective permissions
    const effectivePermissions =
      await this.permissionComputeService.getEffectivePermissions(user.id);

    // 4. Wildcard check — Super Admin bypass
    if (effectivePermissions.has('*:*')) {
      return true;
    }

    // 5. Check if user has ALL required permissions
    const hasAllPermissions = requiredPermissions.every((perm) =>
      effectivePermissions.has(perm),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException(ERRORMESSAGE.INSUFFICIENT_PERMISSION);
    }

    return true;
  }
}
