import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscoveryModule } from '@nestjs/core';
import { Permission } from './domain/entities/permission.entity';
import { Role } from './domain/entities/role.entity';
import { UserPermission } from './domain/entities/user-permission.entity';
import { PermissionComputeService } from './domain/services/permission-compute.service';
import { PermissionSyncService } from './domain/services/permission-sync.service';
import { User } from 'src/modules/auth/domain/entities/user.entity';
import { RoleService } from 'src/modules/rbac/domain/services/role.service';
import { RoleRepository } from 'src/modules/rbac/data/repository/roles.repository';
import { UsersModule } from 'src/modules/users/users.module';
import { UserPermissionService } from 'src/modules/rbac/domain/services/user-permission.service';
import { UserPermissionRepository } from 'src/modules/rbac/data/repository/user-permission.repository';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Permission, Role, UserPermission, User]),
    DiscoveryModule,
    UsersModule,
  ],
  providers: [
    PermissionComputeService,
    PermissionSyncService,
    RoleService,
    RoleRepository,
    UserPermissionRepository,
    UserPermissionService,
  ],
  exports: [PermissionComputeService, TypeOrmModule, RoleService],
})
export class RbacModule {}
