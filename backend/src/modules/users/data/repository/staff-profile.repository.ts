import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StaffProfile } from '../../domain/entities/staff-profile.entity';

@Injectable()
export class StaffProfileRepository {
  constructor(
    @InjectRepository(StaffProfile)
    private readonly repo: Repository<StaffProfile>,
  ) {}

  async findByUserId(userId: string): Promise<StaffProfile | null> {
    return this.repo.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'user.personalInfo', 'user.personalInfo.branch'],
    });
  }

  async saveProfile(profile: StaffProfile): Promise<StaffProfile> {
    return this.repo.save(profile);
  }
}
