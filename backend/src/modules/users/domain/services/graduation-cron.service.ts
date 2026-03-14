import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ENUM_VALUES } from 'src/common/constants/enum-types.constant';
import { EnumService } from 'src/modules/enums/domain/enums.service';
import { PersonalInfoRepository } from '../../data/repository/personal-info-repository';

@Injectable()
export class GraduationCronService {
  constructor(
    private readonly personalInfoRepo: PersonalInfoRepository,
    private readonly enumService: EnumService,
  ) {}
  @Cron('0 0 1 1,7 *') // every Jan 1 and July 1
  async markGraduatedStudentsInactive() {
    const inactiveStatus = await this.enumService.getEnumValueByName(
      ENUM_VALUES.USER_ACC_STATUS.INACTIVE,
    );

    const currentYear = new Date().getFullYear();

    const students =
      await this.personalInfoRepo.findGraduatedStudents(currentYear);

    for (const student of students) {
      student.userAccountStatus = inactiveStatus;
    }

    await this.personalInfoRepo.saveMany(students);
  }
}
