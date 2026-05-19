import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { DiscoveryService, Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { PERMISSIONS_KEY } from 'src/core/decorators/permissions.decorator';

@Injectable()
export class PermissionSyncService implements OnApplicationBootstrap {
  private readonly logger = new Logger(PermissionSyncService.name);

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly reflector: Reflector,
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Scanning application for @Permissions decorators...');

    // Extract all controllers
    const controllers = this.discoveryService.getControllers();
    const discoveredPermissions = new Set<string>();

    for (const wrapper of controllers) {
      const { instance } = wrapper;
      if (!instance) continue;

      const prototype = Object.getPrototypeOf(instance);
      const methods = Object.getOwnPropertyNames(prototype);

      for (const methodName of methods) {
        if (methodName === 'constructor') continue;

        const handler = prototype[methodName];
        if (typeof handler !== 'function') continue;

        // Extract metadata set by @Permissions(...)
        const permissions = this.reflector.get<string[]>(
          PERMISSIONS_KEY,
          handler,
        );

        if (permissions && Array.isArray(permissions)) {
          permissions.forEach((p) => discoveredPermissions.add(p));
        }
      }
    }

    if (discoveredPermissions.size === 0) {
      this.logger.log('No @Permissions decorators found during scan.');
      return;
    }

    this.logger.log(`Found ${discoveredPermissions.size} unique permissions.`);

    // Sync to DB
    const existingPerms = await this.permissionRepo.find();
    const existingSlugs = new Set(existingPerms.map((p) => p.slug));

    const newPerms: Partial<Permission>[] = [];

    for (const slug of discoveredPermissions) {
      if (!existingSlugs.has(slug)) {
        // e.g., "assignment:create" -> resource="assignment", action="create"
        const [resource, action] = slug.split(':');
        newPerms.push({
          slug,
          resource: resource || slug,
          action: action || 'unknown',
          description: `Auto-synced permission for ${slug}`,
        });
      }
    }

    if (newPerms.length > 0) {
      await this.permissionRepo.save(newPerms);
      this.logger.log(
        `Successfully auto-synced ${newPerms.length} new permissions to the database.`,
      );
    } else {
      this.logger.log('Database permissions are already up to date.');
    }
  }
}
