import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/modules/rbac/domain/entities/role.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RoleRepository {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}
  async findEntityById(roleId: string) {
    return await this.roleRepository.findOne({
      where: { id: roleId },
    });
  }
  async findEntityByName(name: string) {
    return await this.roleRepository.findOne({
      where: { name },
    });
  }
}
