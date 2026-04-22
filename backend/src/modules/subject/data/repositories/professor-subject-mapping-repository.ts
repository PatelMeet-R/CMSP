import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { ProfessorSubMapping } from '../../domain/entities/professors-subject.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { FindSubjectMappingQueryDto } from 'src/common/pagination/dto/find-subject-mapping-query.dto';
import { ROLES } from 'src/common/constants/roles.constant';
import { paginate } from 'src/common/pagination/utils/pagination.util';
import type { PaginatedResponse } from 'src/common/pagination/interface/paginated-response.interface';

@Injectable()
export class ProfessorSubMappingRepository {
  private MappingListCacheKeys: Set<string> = new Set();
  constructor(
    @InjectRepository(ProfessorSubMapping)
    private readonly repo: Repository<ProfessorSubMapping>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async saveAssignedSubject(data: ProfessorSubMapping) {
    const saved = await this.repo.save(data);
    await this.clearPaginationCache();
    return saved;
  }
  async findExisting(
    professorId: number,
    subjectId: number,
    semesterId: number,
    yearId: number,
  ) {
    return this.repo.findOne({
      where: {
        professor: { id: professorId },
        subject: { id: subjectId },
        semester: { id: semesterId },
        academicYear: { id: yearId },
      },
    });
  }
  async findAssignSubjectByIdWithRelations(id: number) {
    return this.repo.findOne({
      where: { id },
      relations: [
        'professor',
        'professor.personalInfo',
        'subject',
        'semester',
        'academicYear',
        'assignedBy',
        'assignedBy.personalInfo',
      ],
    });
  }
  async findAssignSubjectByProfessorId(professorId: number) {
    return this.repo
      .createQueryBuilder('mapping')
      .leftJoinAndSelect('mapping.subject', 'subject')
      .leftJoinAndSelect('mapping.semester', 'semester')
      .leftJoinAndSelect('mapping.academicYear', 'academicYear')
      .where('mapping.professorId = :professorId', { professorId })
      .getMany();
  }
  async findAllAssignSubjectDetails(
    query: FindSubjectMappingQueryDto,
    currentUserId: number,
    currentUserRole?: string,
    currentUserBranchId?: number,
  ): Promise<PaginatedResponse<ProfessorSubMapping>> {
    const {
      page = 1,
      limit = 10,
      search,
      branchId,
      semesterId,
      academicYearId,
    } = query;
    const cacheKey = `mapping_p${page}_l${limit}_s${search}_b${branchId}_sem${semesterId}_a${academicYearId}`;

    this.MappingListCacheKeys.add(cacheKey);
    const getCachedData =
      await this.cacheManager.get<PaginatedResponse<ProfessorSubMapping>>(
        cacheKey,
      );
    if (getCachedData) {
      console.log(
        `Cache Hit -------> Returning Mapping list from Cache ${cacheKey}`,
      );
      return getCachedData;
    }
    console.log(`Cache Miss------> Returning Mapping list from database`);

    const queryBuilder = this.repo
      .createQueryBuilder('mapping')

      .leftJoin('mapping.professor', 'professor')
      .leftJoin('professor.personalInfo', 'pinfo')
      .leftJoin('mapping.subject', 'subject')
      .leftJoin('subject.branch', 'subjectBranch') //
      .leftJoin('mapping.semester', 'semester')
      .leftJoin('mapping.academicYear', 'academicYear')
      .leftJoin('mapping.assignedBy', 'assignedBy')
      .leftJoin('assignedBy.personalInfo', 'assignedByInfo')

      .select([
        'mapping.id',
        'mapping.createdAt',

        // Professor Data
        'professor.id',
        'professor.email',
        'pinfo.firstName',
        'pinfo.lastName',
        'pinfo.primaryMobileNumber',

        // Subject Data
        'subject.id',
        'subject.name',
        'subject.code',

        // Branch Data (From the Subject!)
        'subjectBranch.id',
        'subjectBranch.name',

        // Enum Data
        'semester.id',
        'semester.key',
        'academicYear.id',
        'academicYear.key',

        // Assigner Data
        'assignedBy.id',
        'assignedByInfo.firstName',
        'assignedByInfo.lastName',
      ])
      .orderBy('mapping.createdAt', 'DESC');

    if (currentUserRole === ROLES.HOD && currentUserBranchId) {
      queryBuilder.andWhere('subject.branchId = :branchId', {
        branchId: currentUserBranchId,
      });
    } else if (currentUserRole === ROLES.PROFESSOR) {
      queryBuilder.andWhere('professor.id = :userId', {
        userId: currentUserId,
      });
    }

    // ====== DYNAMIC FILTERS ======

    if (branchId) {
      queryBuilder.andWhere('subject.branchId = :filteredBranchId', {
        filteredBranchId: branchId,
      });
    }
    if (semesterId) {
      queryBuilder.andWhere('semester.id = :semesterId', { semesterId });
    }
    if (academicYearId) {
      queryBuilder.andWhere('mapping.academicYearId = :academicYearId', {
        academicYearId,
      });
    }

    // ====== SEARCH ======

    if (search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('subject.name ILIKE :search', { search: `%${search}%` })
            .orWhere('subject.code ILIKE :search', { search: `%${search}%` })
            .orWhere('pinfo.firstName ILIKE :search', { search: `%${search}%` })
            .orWhere('pinfo.lastName ILIKE :search', { search: `%${search}%` })
            .orWhere(
              "CONCAT(pinfo.firstName, ' ', pinfo.lastName) ILIKE :search",
              { search: `%${search}%` },
            );
        }),
      );
    }

    const responseResult = await paginate(queryBuilder, query);
    await this.cacheManager.set(cacheKey, responseResult, 30000);
    return responseResult;
  }

  // ==========================
  async findMyActiveSubjects(professorId: number, academicYearId: number) {
    return await this.repo.find({
      where: {
        professor: { id: professorId },
        academicYear: { id: academicYearId },
      },
      relations: ['subject', 'semester'],
      select: {
        id: true,
        subject: { id: true, name: true, code: true },
        semester: { id: true, value: true },
      },
    });
  }
  // ==========================
  // ==========================
  async clearPaginationCache() {
    for (const key of this.MappingListCacheKeys) {
      await this.cacheManager.del(key);
    }
    this.MappingListCacheKeys.clear();
  }
  // ==========================
  async softRemoveMapping(mapping: ProfessorSubMapping) {
    const removed = await this.repo.softRemove(mapping);
    await this.clearPaginationCache();
    return removed;
  }
  // ==========================
  async findHistoryByProfessorId(professorId: number) {
    return this.repo.find({
      where: { professor: { id: professorId } },
      relations: ['subject', 'semester', 'academicYear'],
      withDeleted: true, // Fetch soft-deleted records for the audit trail
      order: {
        academicYear: { value: 'DESC' },
        semester: { value: 'DESC' },
      },
    });
  }
  // ===========================
}
