import { InjectRepository } from '@nestjs/typeorm';
import { Subject } from '../../domain/entities/subject.entity';
import { Inject, Injectable } from '@nestjs/common';
import { Brackets, Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { FindSubjectQueryDto } from 'src/common/pagination/dto/find-subject-query.dto';
import type { PaginatedResponse } from 'src/common/pagination/interface/paginated-response.interface';
import { ROLES } from 'src/common/constants/roles.constant';
import { paginate } from 'src/common/pagination/utils/pagination.util';

@Injectable()
export class SubjectRepository {
  // private SubjectsListCacheKeys: Set<string> = new Set();
  constructor(
    @InjectRepository(Subject)
    private readonly repo: Repository<Subject>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async saveSubject(subject: Subject): Promise<Subject> {
    const SavedEntity = await this.repo.save(subject);
    await this.clearPaginationCache();
    await this.clearSingleSubjectCache(SavedEntity.id);
    return SavedEntity;
  }

  async findSubjectById(subjectId: string): Promise<Subject | null> {
    const cacheKey = `subject_${subjectId}`;

    const cachedSubject = await this.cacheManager.get<Subject>(cacheKey);

    if (cachedSubject) {
      return cachedSubject;
    }

    const subject = await this.repo.findOne({
      where: { id: subjectId },
      relations: ['branch', 'semester'],
    });

    // STORE THE SUBJECT IN CACHE
    if (subject) await this.cacheManager.set(cacheKey, subject, 30000);
    return subject;
  }

  async IsSubjectWithCodeExist(code: string): Promise<boolean> {
    return await this.repo
      .createQueryBuilder('subject')
      .where('subject.code = :code', { code })
      .getExists();
  }

  // private generateSubjectsListCacheKey(query: FindSubjectQueryDto): string {
  //   const { page = 1, limit = 20, search, branchId, semesterId } = query;
  //   return `subjects_p${page}_l${limit}_s${search || 'all'}_b${branchId || 'all'}_sem${semesterId || 'all'}`;
  // }
  private generateSubjectsListCacheKey(query: FindSubjectQueryDto): string {
    return `subjects_p${query.page || 1}_l${query.limit || 20}_s${query.search || 'all'}_b${query.branchId || 'all'}_sem${query.semesterId || 'all'}`;
  }

  async findAll(
    query: FindSubjectQueryDto,
    canAccessAllBranches: boolean = false,
    branchIdConstraint?: string,
  ): Promise<PaginatedResponse<Subject>> {
    const cacheKey = this.generateSubjectsListCacheKey(query);

    const getCachedData =
      await this.cacheManager.get<PaginatedResponse<Subject>>(cacheKey);

    if (getCachedData) {
      console.log(
        `Cache Hit -------> Returning Subject list from Cache ${cacheKey}`,
      );

      return getCachedData;
    }

    console.log(`Cache Miss------> Returning Subject list from database`);

    const { search, branchId, semesterId } = query;

    const queryBuilder = this.repo
      .createQueryBuilder('subject')
      .leftJoin('subject.branch', 'branch')
      .leftJoin('subject.semester', 'semester')
      .select([
        'subject.id',
        'subject.code',
        'subject.name',
        'subject.createdAt',
        //--------------------
        'semester.key',
        'branch.id',
        'branch.name',
      ])
      .orderBy('subject.createdAt', 'DESC');

    // ====== PBAC DATA ISOLATION ======
    if (!canAccessAllBranches && branchIdConstraint) {
      queryBuilder.andWhere('subject.branchId = :branchIdConstraint', {
        branchIdConstraint,
      });
    }

    if (branchId) {
      queryBuilder.andWhere('subject.branchId = :filteredBranchId', {
        filteredBranchId: branchId,
      });
    }

    if (semesterId) {
      queryBuilder.andWhere('subject.semesterId = :semesterId', { semesterId });
    }

    if (search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('subject.name ILIKE :search', {
            search: `%${search}%`,
          }).orWhere('subject.code ILIKE :search', {
            search: `%${search}%`,
          });
        }),
      );
    }
    const responseResult = await paginate(queryBuilder, query);
    await this.cacheManager.set(cacheKey, responseResult, 30000);
    return responseResult;
  }

  //===========================================

  async searchSubjectsForCombobox(
    searchTerm: string,
    semesterId?: string,
    branchId?: string,
    limit: number = 10,
  ) {
    const queryBuilder = this.repo
      .createQueryBuilder('subject')
      .leftJoinAndSelect('subject.semester', 'semester');

    // If a semester ID is provided, LOCK the search to that semester
    if (semesterId) {
      queryBuilder.andWhere('subject.semesterId = :semesterId', { semesterId });
    }
    if (branchId) {
      queryBuilder.andWhere('subject.branchId = :branchId', { branchId });
    }

    if (searchTerm) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('subject.name ILIKE :search', {
            search: `%${searchTerm}%`,
          }).orWhere('subject.code ILIKE :search', {
            search: `%${searchTerm}%`,
          });
        }),
      );
    }

    queryBuilder.limit(limit);
    return queryBuilder.getMany();
  }
  // ======================================
  async clearSingleSubjectCache(subjectId: string) {
    await this.cacheManager.del(`subject_${subjectId}`);
  }
  // ======================================
  async clearPaginationCache() {
    const cacheStores = (this.cacheManager as any).stores;
    const pattern = 'subjects_p*';

    if (Array.isArray(cacheStores)) {
      for (const store of cacheStores) {
        if (typeof store.keys === 'function') {
          try {
            const keys = await store.keys(pattern);
            for (const key of keys) await this.cacheManager.del(key);
          } catch (e) {}
        }
      }
    } else {
      const store = (this.cacheManager as any).store;
      if (store && typeof store.keys === 'function') {
        const keys = await store.keys(pattern);
        for (const key of keys) await this.cacheManager.del(key);
      }
    }
  }
  // ======================================
  // ======================================
}
