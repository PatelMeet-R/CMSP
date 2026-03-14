import { DataSource } from 'typeorm';
import { Subject } from 'src/modules/subject/domain/entities/subject.entity';
import { Branch } from 'src/modules/branch/domain/entities/branch.entity';
import { EnumValue } from 'src/modules/enums/domain/entities/enumValue.entity';
import { SUBJECTS_BY_BRANCH } from './subject/all-subject';
import { ENUM_TYPES } from 'src/common/constants/enum-types.constant';

export async function seedSubjects(dataSource: DataSource) {
  const subjectRepo = dataSource.getRepository(Subject);
  const branchRepo = dataSource.getRepository(Branch);
  const enumValueRepo = dataSource.getRepository(EnumValue);

  const semesters = await enumValueRepo.find({
    where: {
      type: { type: ENUM_TYPES.SEMESTER },
    },
    relations: ['type'],
  });

  const semMap = Object.fromEntries(semesters.map((s) => [s.key, s]));

  for (const branchCode of Object.keys(SUBJECTS_BY_BRANCH)) {
    const branch = await branchRepo.findOne({
      where: { code: branchCode },
    });

    if (!branch) {
      console.log(`Branch ${branchCode} not found`);
      continue;
    }

    const subjects = SUBJECTS_BY_BRANCH[branchCode];

    for (const s of subjects) {
      const exists = await subjectRepo.findOne({
        where: {
          code: s.code,
          branch: { id: branch.id },
        },
        relations: ['branch'],
      });

      if (exists) continue;

      await subjectRepo.save({
        name: s.name,
        code: s.code,
        branch: branch,
        semester: semMap[s.sem],
      });
    }

    console.log('----------------------------------');
    console.log(`Subjects seeded for ${branchCode}`);
    console.log('----------------------------------');
  }
  console.log('----------------------------------');
  console.log('All subjects seeded successfully');
  console.log('----------------------------------');
}
