import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Branch } from '../../domain/entities/branch.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BranchRepository {
  constructor(
    @InjectRepository(Branch)
    private readonly repo: Repository<Branch>,
  ) {}
  async findAll(): Promise<Branch[]> {
    return this.repo.find({
      select: ['id', 'name', 'code'],
      order: { name: 'ASC' },
    });
  }
  async findByName(name: string): Promise<Branch | null> {
    return this.repo.findOne({ where: { name } });
  }
  async findById(id: number): Promise<Branch | null> {
    return this.repo.findOne({
      where: { id },
    });
  }
  async createOrUpdateAndSave(data: Partial<Branch>): Promise<Branch> {
    const branch = this.repo.create(data);
    return this.repo.save(branch);
  }
  async save(branch: Branch): Promise<Branch> {
    return this.repo.save(branch);
  }
}
