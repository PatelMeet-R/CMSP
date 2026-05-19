import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPermission } from '../../domain/entities/user-permission.entity';

@Injectable()
export class UserPermissionRepository {
  constructor(
    @InjectRepository(UserPermission)
    private readonly repo: Repository<UserPermission>,
  ) {}

  async save(userPermission: UserPermission): Promise<UserPermission> {
    return this.repo.save(userPermission);
  }

  async findSpecificOverride(
    userId: string,
    permissionId: string,
  ): Promise<UserPermission | null> {
    return this.repo.findOne({
      where: { user: { id: userId }, permission: { id: permissionId } },
    });
  }

  async remove(userPermission: UserPermission): Promise<void> {
    await this.repo.remove(userPermission);
  }

  async findOverridesByUserId(userId: string): Promise<UserPermission[]> {
    return this.repo.find({
      where: { user: { id: userId } },
      relations: ['permission'],
    });
  }
}
