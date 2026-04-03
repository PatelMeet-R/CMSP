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
  private SubjectsListCacheKeys: Set<string> = new Set();
  constructor(
    @InjectRepository(Subject)
    private readonly repo: Repository<Subject>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async saveSubject(subject: Subject): Promise<Subject> {
    const SavedEntity = await this.repo.save(subject);
    await this.clearPaginationCache();
    return SavedEntity;
  }

  async findSubjectById(subjectId: number): Promise<Subject | null> {
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
    await this.cacheManager.set(cacheKey, subject, 30000);
    return subject;
  }

  async IsSubjectWithCodeExist(code: string): Promise<boolean> {
    const exists = await this.repo
      .createQueryBuilder('subject')
      .where('subject.code = :code', { code })
      .getExists();

    return exists;
  }

  private generateSubjectsListCacheKey(query: FindSubjectQueryDto): string {
    const { page = 1, limit = 20, search, branchId, semesterId } = query;
    return `subjects_p${page}_l${limit}_s${search || 'all'}_b${branchId || 'all'}_sem${semesterId || 'all'}`;
  }

  async findAll(
    query: FindSubjectQueryDto,
    currentUserRole?: string,
    currentUserBranchId?: number,
  ): Promise<PaginatedResponse<Subject>> {
    const cacheKey = this.generateSubjectsListCacheKey(query);
    this.SubjectsListCacheKeys.add(cacheKey);

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

    //======  OWN BRANCH GATE ======
    if (
      (currentUserRole === ROLES.HOD ||
        currentUserRole === ROLES.PROFESSOR ||
        currentUserRole === ROLES.STUDENT) &&
      currentUserBranchId
    ) {
      queryBuilder.andWhere('subject.branchId = :branchId', {
        branchId: currentUserBranchId,
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

  async clearSingleSubjectCache(subjectId: number) {
    await this.cacheManager.del(`subject_${subjectId}`);
  }
  async clearPaginationCache() {
    for (const key of this.SubjectsListCacheKeys) {
      await this.cacheManager.del(key);
    }
    this.SubjectsListCacheKeys.clear();
    console.log('======');
    console.log(' Pagination Cache Cleared!');
    console.log('======');
  }
}
