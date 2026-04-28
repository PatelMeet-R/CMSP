import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Branch } from '../../domain/entities/branch.entity';
import { Repository } from 'typeorm';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class BranchRepository {
  private readonly BRANCH_CACHE_KEY = 'all_branches_list';
  constructor(
    @InjectRepository(Branch)
    private readonly repo: Repository<Branch>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // ==================================

  async findAll(): Promise<Branch[]> {
    const cachedBranches = await this.cacheManager.get<Branch[]>(
      this.BRANCH_CACHE_KEY,
    );
    if (cachedBranches) {
      console.log('Cache Hit -> Returning Branches from Cache');
      return cachedBranches;
    }

    console.log('Cache Miss -> Fetching Branches from DB');
    // 2. Fetch from DB
    const branches = await this.repo.find({
      where: { isSystem: false },
      select: ['id', 'name', 'code'],
      order: { name: 'ASC' },
    });

    // 3. Store in cache for 24 hours (86400000 ms)
    await this.cacheManager.set(this.BRANCH_CACHE_KEY, branches, 86400000);

    return branches;
  }

  // ==================================

  async findByName(name: string): Promise<Branch | null> {
    return this.repo.findOne({ where: { name } });
  }

  // ==================================

  async findById(id: string): Promise<Branch | null> {
    return this.repo.findOne({
      where: { id },
    });
  }

  // ==================================

  async createOrUpdateAndSave(data: Partial<Branch>): Promise<Branch> {
    const branch = this.repo.create(data);
    const saved = await this.repo.save(branch);
    await this.cacheManager.del(this.BRANCH_CACHE_KEY);
    return saved;
  }

  // ==================================

  async save(branch: Branch): Promise<Branch> {
    const saved = await this.repo.save(branch);
    await this.cacheManager.del(this.BRANCH_CACHE_KEY);
    return saved;
  }
  // ==================================
  // ==================================
}
