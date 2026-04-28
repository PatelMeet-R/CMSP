import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { PersonalInfo } from '../../domain/entities/personal-info.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { FindUsersPersonalInfoQueryDto } from 'src/common/pagination/dto/find-users-personal-query.dto';
import { PaginatedResponse } from 'src/common/pagination/interface/paginated-response.interface';
import type { Cache } from 'cache-manager';
import { paginate } from 'src/common/pagination/utils/pagination.util';
// import { ROLES } from 'src/common/constants/roles.constant';

@Injectable()
export class PersonalInfoRepository {
  private UsersPIListCacheKeys: Set<string> = new Set();
  constructor(
    @InjectRepository(PersonalInfo)
    private readonly repo: Repository<PersonalInfo>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async saveInfo(personalInfo: PersonalInfo): Promise<PersonalInfo> {
    const savedEntity = await this.repo.save(personalInfo);

    await this.clearCachePattern('users_p*');

    if (personalInfo.user?.id) {
      await this.clearSingleUserCache(personalInfo.user.id);
    }

    return savedEntity;
  }

  //===================================
  async findPersonalInfoById(
    personalInfoId: string,
  ): Promise<PersonalInfo | null> {
    return await this.repo
      .createQueryBuilder('profile')
      .leftJoinAndSelect('profile.user', 'user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('profile.branch', 'branch')
      .leftJoinAndSelect('profile.gender', 'gender')
      .leftJoinAndSelect('profile.userAccountStatus', 'status')
      .leftJoinAndSelect('profile.profileImage', 'profileImage')
      .where('profile.id = :id', { id: personalInfoId })
      .getOne();
  }
  // ==========================================

  async findAllPersonalInfo(): Promise<PersonalInfo[]> {
    const data = await this.repo.find({
      relations: ['expectedGraduateYear'],
    });
    return data;
  }
  // ==========================================

  async findGraduatedStudents(currentYear: number): Promise<PersonalInfo[]> {
    return this.repo
      .createQueryBuilder('pi')
      .leftJoinAndSelect('pi.expectedGraduateYear', 'year')
      .where('CAST(year.value AS INT) < :currentYear', { currentYear })
      .getMany();
  }
  async saveMany(data: PersonalInfo[]): Promise<PersonalInfo[]> {
    return this.repo.save(data);
  }

  async isUserExistWithEnrollment(enrollmentNumber: string): Promise<boolean> {
    const exists = await this.repo
      .createQueryBuilder('personalInfo')
      .where('personalInfo.enrollmentNumber = :enrollmentNumber', {
        enrollmentNumber,
      })
      .getExists();

    return exists;
  }

  async getPersonalProfileByAuthId(userId: string) {
    const cacheKey = `user_pi${userId}`;
    const cachedPI = await this.cacheManager.get<PersonalInfo>(cacheKey);

    if (cachedPI) {
      return cachedPI;
    }

    const profile = await this.repo
      .createQueryBuilder('profile')
      .leftJoin('profile.user', 'user')
      .leftJoin('profile.gender', 'gender')
      .leftJoin('profile.branch', 'branch')
      .leftJoin('profile.joinedAcademicYear', 'joinedYear')
      .leftJoin('profile.expectedGraduateYear', 'gradYear')
      .leftJoin('profile.userAccountStatus', 'status')
      .leftJoin('profile.profileImage', 'profileImage')
      .select([
        'profile.id',
        'profile.firstName',
        'profile.lastName',
        'profile.enrollmentNumber',
        'profile.primaryMobileNumber',
        'profile.secondaryMobileNumber',
        'profile.city',
        'profile.state',
        'profile.country',
        // -----------------------
        'gender.id',
        'gender.key',
        'branch.id',
        'branch.name',
        'joinedYear.id',
        'joinedYear.key',
        'gradYear.id',
        'gradYear.key',
        'status.id',
        'status.key',
        //-------------------------
        'profileImage.id',
        'profileImage.url',
        'profileImage.publicId',
        'user.id',
      ])
      .where('user.id = :id', { id: userId })
      .getOneOrFail();

    // STORE THE PERSONAL-INFO IN CACHE

    await this.cacheManager.set(cacheKey, profile, 30000);
    return profile;
  }

  // private generateUsersPIListCacheKey(
  //   query: FindUsersPersonalInfoQueryDto,
  // ): string {
  //   const { page = 1, limit = 10, search, branchId, genderId, roleId } = query;
  //   return `users_p${page}_l${limit}_s${search || 'all'}_b${branchId || 'all'}_g${genderId || 'all'}_r${roleId || 'all'}`;
  // }

  // =========================================================
  async FindAll(
    query: FindUsersPersonalInfoQueryDto,
    canAccessAllBranches: boolean = false,
    branchIdConstraint?: string,
  ): Promise<PaginatedResponse<PersonalInfo>> {
    const cacheKey = this.generateUsersPIListCacheKey(
      query,
      branchIdConstraint,
    );
    const cached =
      await this.cacheManager.get<PaginatedResponse<PersonalInfo>>(cacheKey);
    if (cached) return cached;

    const {
      search,
      genderId,
      roleId,
      branchId: queryBranchId,
      statusKey,
    } = query;

    const queryBuilder = this.repo
      .createQueryBuilder('profile')
      .leftJoinAndSelect('profile.user', 'user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('profile.branch', 'branch')
      .leftJoinAndSelect('profile.gender', 'gender')
      .leftJoinAndSelect('profile.userAccountStatus', 'status')
      .orderBy('profile.createdAt', 'DESC');

    // ==========================================
    // GATE 1: PBAC DATA ISOLATION
    // ==========================================
    // If not super admin, restrict to their branch
    if (!canAccessAllBranches && branchIdConstraint) {
      queryBuilder.andWhere('profile.branchId = :branchIdConstraint', {
        branchIdConstraint,
      });
    }

    // ==========================================
    // GATE 2: FILTERS
    // ==========================================
    if (queryBranchId) {
      queryBuilder.andWhere('profile.branchId = :queryBranchId', {
        queryBranchId,
      });
    }
    if (genderId) {
      queryBuilder.andWhere('profile.genderId = :genderId', { genderId });
    }
    if (roleId) {
      queryBuilder.andWhere('user.roleId = :roleId', { roleId });
    }
    if (statusKey) {
      queryBuilder.andWhere('status.key = :statusKey', { statusKey });
    }
    if (search) {
      // Optimized Search using ILIKE (ensure pg_trgm index exists on name/enrollment)
      queryBuilder.andWhere(
        "(profile.firstName || ' ' || profile.lastName ILIKE :search OR profile.enrollmentNumber ILIKE :search)",
        { search: `%${search}%` },
      );
    }

    const responseResult = await paginate(queryBuilder, query);
    await this.cacheManager.set(cacheKey, responseResult, 30000); // 30s cache
    return responseResult;
  }
  // ==============================
  private generateUsersPIListCacheKey(
    query: FindUsersPersonalInfoQueryDto,
    branchConstraint?: string,
  ): string {
    return (
      `users_p${query.page || 1}` +
      `_l${query.limit || 10}` +
      `_bc${branchConstraint || 'all'}` + // Branch Constraint (PBAC)
      `_qb${query.branchId || ''}` + // Query Branch Filter
      `_g${query.genderId || ''}` + // Gender Filter
      `_r${query.roleId || ''}` + // Role Filter
      `_st${query.statusKey || ''}` +
      `_s${query.search || ''}`
    );
  }

  // ======================================

  async clearSingleUserCache(userId: string) {
    await this.cacheManager.del(`user_pi${userId}`);
  }
  // ======================================

  async clearPaginationCache() {
    for (const key of this.UsersPIListCacheKeys) {
      await this.cacheManager.del(key);
    }
    this.UsersPIListCacheKeys.clear();
    console.log('======');
    console.log(' Pagination Cache Cleared!');
    console.log('======');
  }
  // ======================================

  async searchStaffForCombobox(
    searchTerm: string,
    limit: number = 15,
    branchId?: string,
  ) {
    const queryBuilder = this.repo
      .createQueryBuilder('profile')
      .leftJoinAndSelect('profile.user', 'user')
      .leftJoinAndSelect('user.role', 'role')
      .where('role.key IN (:...roles)', { roles: ['PROFESSOR', 'HOD'] });

    if (branchId) {
      queryBuilder.andWhere('profile.branchId = :branchId', { branchId });
    }

    if (searchTerm) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('profile.firstName ILIKE :search', {
            search: `%${searchTerm}%`,
          })
            .orWhere('profile.lastName ILIKE :search', {
              search: `%${searchTerm}%`,
            })
            .orWhere('profile.enrollmentNumber ILIKE :search', {
              search: `%${searchTerm}%`,
            })
            .orWhere(
              "CONCAT(profile.firstName, ' ', profile.lastName) ILIKE :search",
              { search: `%${searchTerm}%` },
            );
        }),
      );
    }

    queryBuilder.limit(limit);
    return queryBuilder.getMany();
  }

  // ======================================
  // async clearCachePattern(pattern: string) {
  //   const store = this.cacheManager.stores;
  //   if ('keys' in store) {
  //     const keys = await (store as any).keys(pattern);
  //     for (const key of keys) {
  //       await this.cacheManager.del(key);
  //     }
  //   }
  // }
  // ======================================
  async clearCachePattern(pattern: string) {
    // Access 'stores' as per your error message suggestion
    const cacheStores = (this.cacheManager as any).stores;

    if (Array.isArray(cacheStores)) {
      for (const store of cacheStores) {
        // Check if the store supports pattern searching (like Redis)
        if (typeof store.keys === 'function') {
          try {
            const keys = await store.keys(pattern);
            for (const key of keys) {
              await this.cacheManager.del(key);
            }
          } catch (error) {
            console.error(`Failed to clear cache pattern ${pattern}:`, error);
          }
        }
      }
    } else {
      // Fallback for older versions or single store configurations
      const store = (this.cacheManager as any).store;
      if (store && typeof store.keys === 'function') {
        const keys = await store.keys(pattern);
        for (const key of keys) {
          await this.cacheManager.del(key);
        }
      }
    }
  }
  // ======================================

  async findDormantActiveUsers(thresholdDate: Date): Promise<PersonalInfo[]> {
    return this.repo
      .createQueryBuilder('pi')
      .leftJoinAndSelect('pi.userAccountStatus', 'status')
      .leftJoinAndSelect('pi.user', 'user')
      .where('status.key = :activeKey', { activeKey: 'ACTIVE' }) 
      .andWhere('user.lastLoginAt < :thresholdDate', { thresholdDate }) // Logged in before the threshold
      .getMany();
  }
  // ======================================
  // ======================================
}
