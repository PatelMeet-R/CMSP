import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Assignment } from '../domain/entity/assignment.entity';
import { Brackets, Repository } from 'typeorm';
import { FindAssignmentQueryDto } from 'src/common/pagination/dto/find-assignment-query.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import type { PaginatedResponse } from 'src/common/pagination/interface/paginated-response.interface';
import { paginate } from 'src/common/pagination/utils/pagination.util';

@Injectable()
export class AssignmentRepository {
  private readonly AssignmentListCacheKeys = new Set<string>();
  constructor(
    @InjectRepository(Assignment)
    private readonly repo: Repository<Assignment>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  async saveAssignment(data: Assignment): Promise<Assignment> {
    return this.repo.save(data);
  }
  async findAssignmentByIdWithAttachmentRelation(
    assignmentId: number,
  ): Promise<Assignment | null> {
    return this.repo.findOne({
      where: { id: assignmentId },
      relations: ['attachment', 'branch'],
    });
  }

  async removeAssignment(assignment: Assignment): Promise<void> {
    await this.repo.remove(assignment);
  }

  // async findAllByFilter(
  //   branchId: number,
  //   semesterId: number,
  // ): Promise<Assignment[]> {
  //   return await this.repo.find({
  //     where: {
  //       branch: { id: branchId },
  //       semester: { id: semesterId },
  //     },
  //     relations: ['subject', 'branch', 'semester', 'attachment'],
  //     order: { createdAt: 'DESC' },
  //   });
  // }

  async findAssignmentByIdWithAllRelation(
    id: number,
  ): Promise<Assignment | null> {
    return await this.repo.findOne({
      where: { id },
      relations: [
        'subject',
        'branch',
        'semester',
        'attachment',
        'academicYear',
      ],
    });
  }
  async findAllAssignment(): Promise<Assignment[]> {
    return await this.repo.find({
      relations: [
        'subject',
        'branch',
        'semester',
        'attachment',
        'academicYear',
      ],
    });
  }
  // async findAllAssignmentByBranchId(branchId: number): Promise<Assignment[]> {
  //   return await this.repo.find({
  //     where: { branch: { id: branchId } },
  //     relations: [
  //       'subject',
  //       'branch',
  //       'semester',
  //       'attachment',
  //       'academicYear',
  //     ],
  //   });
  // }
  private generateCacheKey(
    query: FindAssignmentQueryDto,
    branchId?: number,
    role?: string,
  ): string {
    return `assignments_p${query.page}_l${query.limit}_s${query.search || ''}_b${branchId || ''}_y${query.academicYearId || ''}_r${role || ''}`;
  }

  async findAllAssignmentsWithFilters(
    query: FindAssignmentQueryDto,
    effectiveBranchId?: number,
    role?: string,
    creatorId?: number,
  ): Promise<PaginatedResponse<Assignment>> {
    const cacheKey =
      this.generateCacheKey(query, effectiveBranchId, role) +
      `_c${creatorId || ''}`;

    // 1. Check Cache
    const getCachedData =
      await this.cacheManager.get<PaginatedResponse<Assignment>>(cacheKey);
    if (getCachedData) {
      return getCachedData;
    }

    // 2. Build Query
    const { search, academicYearId } = query;
    const queryBuilder = this.repo
      .createQueryBuilder('assignment')
      .leftJoinAndSelect('assignment.subject', 'subject')
      .leftJoinAndSelect('assignment.branch', 'branch')
      .leftJoinAndSelect('assignment.semester', 'semester')
      .leftJoinAndSelect('assignment.attachment', 'attachment')
      .leftJoinAndSelect('assignment.academicYear', 'academicYear')
      .orderBy('assignment.createdAt', 'DESC');

    if (creatorId) {
      queryBuilder.andWhere('assignment.createdBy = :creatorId', { creatorId });
    }

    if (effectiveBranchId) {
      queryBuilder.andWhere('branch.id = :branchId', {
        branchId: effectiveBranchId,
      });
    }

    if (academicYearId) {
      queryBuilder.andWhere('assignment.academicYearId = :academicYearId', {
        academicYearId,
      });
    }

    if (search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('assignment.title ILIKE :search', { search: `%${search}%` })
            .orWhere('subject.name ILIKE :search', { search: `%${search}%` })
            .orWhere('subject.code ILIKE :search', { search: `%${search}%` });
        }),
      );
    }

    // 3. Paginate and Store
    const responseResult = await paginate(queryBuilder, query);

    this.AssignmentListCacheKeys.add(cacheKey);
    await this.cacheManager.set(cacheKey, responseResult, 30000); // 30s cache like your subject

    return responseResult;
  }

  // =====  CACHE HELPERS  =====
  async clearSingleAssignmentCache(id: number) {
    await this.cacheManager.del(`assignment_${id}`);
  }

  async clearPaginationCache() {
    for (const key of this.AssignmentListCacheKeys) {
      await this.cacheManager.del(key);
    }
    this.AssignmentListCacheKeys.clear();
  }
}
