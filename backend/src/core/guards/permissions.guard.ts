import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PermissionComputeService } from 'src/modules/rbac/domain/services/permission-compute.service';
import { ERRORMESSAGE } from 'src/common/constants/error.message';
import { IS_PUBLIC_KEY } from 'src/core/decorators/public.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly permissionComputeService: PermissionComputeService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Is it a @Public() route? (No JWT needed)
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // 2. Read required permissions from @Permissions() decorator
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no permissions defined on this route, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // 3. Get the authenticated user from request
    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException(ERRORMESSAGE.USER_NOT_AUTHENTICATED);
    }

    // 4. Compute the user's effective permissions (single call, not two)
    const effectivePermissions =
      await this.permissionComputeService.getEffectivePermissions(user.id);

    // 5. God-mode wildcard bypass — Super Admin
    if (effectivePermissions.has('*:*')) {
      return true;
    }

    // 6. Check if user has ANY of the required permissions (OR logic)
    //    This is crucial for routes like:
    //    @Permissions('assignment:read', 'assignment:read-self')
    //    where having EITHER permission should grant access.
    const hasPermission = requiredPermissions.some((perm) =>
      effectivePermissions.has(perm),
    );

    if (!hasPermission) {
      this.logger.warn(
        `Access denied for user ${user.id}. ` +
          `Required (any): [${requiredPermissions.join(', ')}]. ` +
          `Has: [${Array.from(effectivePermissions).join(', ')}]`,
      );
      throw new ForbiddenException(ERRORMESSAGE.INSUFFICIENT_PERMISSION);
    }

    return true;
  }
}
