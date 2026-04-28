import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { EnumService } from 'src/modules/enums/domain/enums.service';
import {
  ENUM_TYPES,
  ENUM_VALUES,
} from 'src/common/constants/enum-types.constant';
import { PersonalInfoRepository } from 'src/modules/users/data/repository/personal-info-repository';

@Injectable()
export class GraduationCronService {
  constructor(
    private readonly personalInfoRepo: PersonalInfoRepository,
    private readonly enumService: EnumService,
  ) {}

  @Cron('0 0 1 1,7 *') // Runs every Jan 1 and July 1
  async markGraduatedStudents() {
    const graduatedStatus = await this.enumService.getMeEnumValueIfExist(
      ENUM_TYPES.USER_ACC_STATUS,
      ENUM_VALUES.USER_ACC_STATUS.GRADUATED,
    );

    if (!graduatedStatus) {
      console.error('GRADUATED status enum is missing from the database!');
      return;
    }

    const currentYear = new Date().getFullYear();
    const students =
      await this.personalInfoRepo.findGraduatedStudents(currentYear);

    for (const student of students) {
      student.userAccountStatus = graduatedStatus;
      //  Add the custom feedback you requested
      student.statusFeedback =
        'Congratulations on completing your journey at our college! As a graduate, you now have alumni access. Certain student perks and features are no longer active.';
    }

    if (students.length > 0) {
      await this.personalInfoRepo.saveMany(students);

      //   Clear the cache
      for (const student of students) {
        if (student.user?.id) {
          await this.personalInfoRepo.clearSingleUserCache(student.user.id);
        }
      }
      console.log(`Successfully graduated ${students.length} students.`);
    }
  }
}
