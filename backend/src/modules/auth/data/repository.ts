import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../domain/entities/user.entity';
import { MoreThan, Repository } from 'typeorm';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}
  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({
      where: { email },
      relations: [
        'personalInfo',
        'personalInfo.branch',
        'personalInfo.userAccountStatus',
      ],
    });
  }
  async findById(id: string): Promise<User | null> {
    return this.repo.findOne({
      where: { id },
      relations: [
        'personalInfo',
        'personalInfo.branch',
        'personalInfo.userAccountStatus',
      ],
    });
  }

  async createAndSave(userData: Partial<User>): Promise<User> {
    const user = this.repo.create(userData);
    return this.repo.save(user);
  }
  async save(user: User): Promise<User> {
    return this.repo.save(user);
  }
  async findValidResetToken(tokenHash: string): Promise<User | null> {
    return this.repo.findOne({
      where: {
        resetPasswordToken: tokenHash,
        resetPasswordExpires: MoreThan(new Date()), // used greater than because expiry must be in future
      },
    });
  }
  async findByIdWithPersonalInfoRelation(id: string) {
    return this.repo.findOne({
      where: { id: id },
      relations: [
        'personalInfo',
        'personalInfo.branch',
        'personalInfo.userAccountStatus',
      ],
    });
  }
  async update(id: string, partialEntity: Partial<User>) {
    return this.repo.update(id, partialEntity);
  }
}
