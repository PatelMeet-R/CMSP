import { Injectable } from '@nestjs/common';
import { RoleRepository } from 'src/modules/rbac/data/repository/roles.repository';

@Injectable()
export class RoleService {
  constructor(private readonly roleRepository: RoleRepository) {}

  async findAll() {
    return this.roleRepository.find();
  }
  async findEntityByRoleId(roleId: string) {
    return this.roleRepository.findEntityById(roleId);
  }
  async findEntityByRoleName(roleName: string) {
    return this.roleRepository.findEntityByName(roleName);
  }
}
