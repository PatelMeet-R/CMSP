import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { PersonalInfo } from '../../domain/entities/personal-info.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { FindUsersPersonalInfoQueryDto } from 'src/common/pagination/dto/find-users-personal-query.dto';
import type { PaginatedResponse } from 'src/common/pagination/interface/paginated-response.interface';
import type { Cache } from 'cache-manager';
import { paginate } from 'src/common/pagination/utils/pagination.util';
import { ROLES } from 'src/common/constants/roles.constant';

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

    await this.clearPaginationCache();

    if (personalInfo.user?.id) {
      await this.clearSingleUserCache(personalInfo.user.id);
    }

    return savedEntity;
  }

  //===================================
  async findPersonalInfoById(
    personalInfoId: number,
  ): Promise<PersonalInfo | null> {
    return await this.repo
      .createQueryBuilder('profile')
      // see their Email and Role
      .leftJoin('profile.user', 'user')
      .leftJoin('user.role', 'role')

      //  Join Branch
      .leftJoin('profile.branch', 'branch')

      //  Join Eager Enums
      .leftJoin('profile.gender', 'gender')
      .leftJoin('profile.joinedAcademicYear', 'joinedYear')
      .leftJoin('profile.expectedGraduateYear', 'gradYear')
      .leftJoin('profile.userAccountStatus', 'status')
      .leftJoin('profile.profileImage', 'profileImage')
      //   Detail View
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
        'profile.postalCode',
        'profile.createdAt',
        // User Info
        'user.id',
        'user.email',
        'role.id',
        'role.key',
        // Relations
        'branch.id',
        'branch.name',
        'gender.id',
        'gender.key',
        'joinedYear.id',
        'joinedYear.key',
        'gradYear.id',
        'gradYear.key',
        'status.id',
        'status.key',
        //  profile Image
        'profileImage.id',
        'profileImage.url',
        'profileImage.publicId',
      ])
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
  async getPersonalProfileByAuthId(userId: number) {
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
      ])
      .where('user.id = :id', { id: userId })
      .getOneOrFail();

    // STORE THE PERSONAL-INFO IN CACHE

    await this.cacheManager.set(cacheKey, profile, 30000);
    return profile;
  }

  private generateUsersPIListCacheKey(
    query: FindUsersPersonalInfoQueryDto,
  ): string {
    const { page = 1, limit = 10, search, branchId, genderId, roleId } = query;
    return `users_p${page}_l${limit}_s${search || 'all'}_b${branchId || 'all'}_g${genderId || 'all'}_r${roleId || 'all'}`;
  }
  // =========================================================
  async FindAll(
    query: FindUsersPersonalInfoQueryDto,
    currentUserRole?: string,
    currentUserBranchId?: number,
  ): Promise<PaginatedResponse<PersonalInfo>> {
    const cacheKey = this.generateUsersPIListCacheKey(query);

    this.UsersPIListCacheKeys.add(cacheKey);

    const getCachedData =
      await this.cacheManager.get<PaginatedResponse<PersonalInfo>>(cacheKey);

    if (getCachedData) {
      console.log(
        `Cache Hit -------> Returning users PI list from Cache ${cacheKey}`,
      );
      return getCachedData;
    }
    console.log(`Cache Miss------> Returning users PI list from database`);

    const { search, genderId, roleId } = query;
    let { branchId } = query;

    const queryBuilder = this.repo
      .createQueryBuilder('profile')
      .leftJoin('profile.user', 'user')
      .leftJoin('user.role', 'role')
      .leftJoin('profile.gender', 'gender')
      .leftJoin('profile.branch', 'branch')
      .leftJoin('profile.joinedAcademicYear', 'joinedYear')
      .leftJoin('profile.expectedGraduateYear', 'gradYear')
      .leftJoin('profile.userAccountStatus', 'status')
      .select([
        'profile.id',
        'profile.firstName',
        'profile.lastName',
        'profile.enrollmentNumber',
        'profile.primaryMobileNumber',
        'profile.city',
        'profile.state',
        'profile.country',
        'profile.createdAt',
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
        // -----------------------
        'role.id',
        'role.key',
        'role.value',
      ])
      .orderBy('profile.createdAt', 'DESC');

    // ==========================================
    //  GATE 1: BASE SECURITY (Hide Super Admins)
    // ==========================================

    if (currentUserRole === ROLES.HOD || currentUserRole === ROLES.PROFESSOR) {
      queryBuilder.andWhere('role.key != :adminRole', {
        adminRole: ROLES.SUPER_ADMIN,
      });
    }

    // ==========================================
    //  GATE 2: DATA ISOLATION (HOD & PROFESSOR)
    // ==========================================
    if (currentUserRole !== ROLES.SUPER_ADMIN && currentUserBranchId) {
      branchId = currentUserBranchId;

      if (currentUserRole === ROLES.PROFESSOR) {
        queryBuilder.andWhere('role.key IN (:studentRole, :profRole)', {
          studentRole: ROLES.STUDENT,
          profRole: ROLES.PROFESSOR,
        });
      }
    }

    // ==========================================
    //  GATE 3: DYNAMIC FRONTEND FILTERS
    // ==========================================
    if (branchId) {
      queryBuilder.andWhere('profile.branchId = :filteredBranchId', {
        filteredBranchId: branchId,
      });
    }

    if (genderId) {
      queryBuilder.andWhere('profile.genderId = :genderId', { genderId });
    }

    if (roleId) {
      queryBuilder.andWhere('user.roleId = :roleId', { roleId });
    }

    if (search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('profile.enrollmentNumber ILIKE :search', {
            search: `%${search}%`,
          })
            .orWhere('profile.firstName ILIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('profile.lastName ILIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('profile.city ILIKE :search', {
              search: `%${search}%`,
            })
            .orWhere(
              "CONCAT(profile.firstName, ' ', profile.lastName) ILIKE :search",
              { search: `%${search}%` },
            );
        }),
      );
    }

    const responseResult = await paginate(queryBuilder, query);
    await this.cacheManager.set(cacheKey, responseResult, 30000);
    return responseResult;
  }
  async clearSingleUserCache(userId: number) {
    await this.cacheManager.del(`user_pi${userId}`);
  }

  async clearPaginationCache() {
    for (const key of this.UsersPIListCacheKeys) {
      await this.cacheManager.del(key);
    }
    this.UsersPIListCacheKeys.clear();
    console.log('======');
    console.log(' Pagination Cache Cleared!');
    console.log('======');
  }
}
