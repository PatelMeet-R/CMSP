import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Assignment } from '../domain/entity/assignment.entity';
import { Brackets, Repository } from 'typeorm';
import { FindAssignmentQueryDto } from 'src/common/pagination/dto/find-assignment-query.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PaginatedResponse } from 'src/common/pagination/interface/paginated-response.interface';
import { paginate } from 'src/common/pagination/utils/pagination.util';

@Injectable()
export class AssignmentRepository {
  // private readonly AssignmentListCacheKeys = new Set<string>();
  constructor(
    @InjectRepository(Assignment)
    private readonly repo: Repository<Assignment>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // ==================================

  async saveAssignment(data: Assignment): Promise<Assignment> {
    return this.repo.save(data);
  }

  // ==================================

  async findAssignmentByIdWithAttachmentRelation(
    assignmentId: string,
  ): Promise<Assignment | null> {
    return this.repo.findOne({
      where: { id: assignmentId },
      relations: ['attachment', 'branch'],
    });
  }

  // ==================================

  async removeAssignment(assignment: Assignment): Promise<void> {
    await this.repo.remove(assignment);
  }

  // ==================================

  async findAssignmentByIdWithAllRelation(
    id: string,
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

  // ==================================

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

  // ==================================

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

  // ==================================

  private generateCacheKey(
    query: FindAssignmentQueryDto,
    branchIdConstraint?: string,
    isSelfConstraintId?: string,
  ): string {
    return `assignments_p${query.page || 1}_l${query.limit || 10}_s${query.search || ''}_b${branchIdConstraint || ''}_y${query.academicYearId || ''}_c${isSelfConstraintId || ''}`;
  }

  async findAllAssignmentsWithFilters(
    query: FindAssignmentQueryDto,
    canAccessAllBranches: boolean,
    branchIdConstraint?: string,
    isSelfConstraintId?: string,
  ): Promise<PaginatedResponse<Assignment>> {
    const cacheKey = this.generateCacheKey(
      query,
      branchIdConstraint,
      isSelfConstraintId,
    );

    const getCachedData =
      await this.cacheManager.get<PaginatedResponse<Assignment>>(cacheKey);
    if (getCachedData) return getCachedData;

    const { search, academicYearId } = query;
    const queryBuilder = this.repo
      .createQueryBuilder('assignment')
      .leftJoinAndSelect('assignment.subject', 'subject')
      .leftJoinAndSelect('assignment.branch', 'branch')
      .leftJoinAndSelect('assignment.semester', 'semester')
      .leftJoinAndSelect('assignment.attachment', 'attachment')
      .leftJoinAndSelect('assignment.academicYear', 'academicYear')
      .orderBy('assignment.createdAt', 'DESC');

    // ====== PBAC DATA ISOLATION ======
    if (isSelfConstraintId) {
      queryBuilder.andWhere('assignment.createdBy = :isSelfConstraintId', {
        isSelfConstraintId,
      });
    } else if (!canAccessAllBranches && branchIdConstraint) {
      queryBuilder.andWhere('branch.id = :branchIdConstraint', {
        branchIdConstraint,
      });
    }

    // ====== DYNAMIC FILTERS ======

    if (query['branchId']) {
      queryBuilder.andWhere('branch.id = :filteredBranchId', {
        filteredBranchId: query['branchId'],
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

    const responseResult = await paginate(queryBuilder, query);
    await this.cacheManager.set(cacheKey, responseResult, 30000);
    return responseResult;
  }

  // =====  CACHE HELPERS  =====
  async clearSingleAssignmentCache(id: string) {
    await this.cacheManager.del(`assignment_${id}`);
  }

  async clearPaginationCache() {
    const cacheStores = (this.cacheManager as any).stores || [
      (this.cacheManager as any).store,
    ];
    for (const store of cacheStores) {
      if (store && typeof store.keys === 'function') {
        try {
          const keys = await store.keys('assignments_p*');
          for (const key of keys) await this.cacheManager.del(key);
        } catch (e) {}
      }
    }
  }
}
