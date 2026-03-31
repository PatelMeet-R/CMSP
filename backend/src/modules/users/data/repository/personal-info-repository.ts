import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonalInfo } from '../../domain/entities/personal-info.entity';

@Injectable()
export class PersonalInfoRepository {
  constructor(
    @InjectRepository(PersonalInfo)
    private readonly repo: Repository<PersonalInfo>,
  ) {}
  async saveInfo(personalInfo: PersonalInfo): Promise<PersonalInfo> {
    return this.repo.save(personalInfo);
  }
  async findPersonalInfoById(
    personalInfoId: number,
  ): Promise<PersonalInfo | null> {
    return this.repo.findOne({
      where: { id: personalInfoId },
      relations: [
        'user',
        'branch',
        'joinedAcademicYear',
        'expectedGraduateYear',
      ],
    });
  }
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
    const profile = await this.repo
      .createQueryBuilder('profile')
      .leftJoin('profile.user', 'user')
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
      ])
      .where('user.id = :id', { id: userId })
      .getOneOrFail();
    return profile;
  }
}
