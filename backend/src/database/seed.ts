import { User } from 'src/modules/auth/domain/entities/user.entity';
import { DataSource } from 'typeorm';
import { seedUsers } from './seeds/super-admin.seed';
import 'dotenv/config';
import { seedUserRoleEnums } from './seeds/role-enum.seed';
import { EnumValue } from 'src/modules/enums/domain/entities/enumValue.entity';
import { EnumType } from 'src/modules/enums/domain/entities/enumType.entity';
import { seedSemsEnum } from './seeds/sem-enum.seed';
import { seedBranches } from './seeds/branch.seed';
import { Branch } from 'src/modules/branch/domain/entities/branch.entity';
import { seedSubjects } from './seeds/subject.seed';
import { Subject } from 'src/modules/subject/domain/entities/subject.entity';
import { seedAcademicYearEnums } from './seeds/academic-year-enum.seed';
import { seedGenderEnums } from './seeds/gender.seed';
import { seedUserAccountStatusEnums } from './seeds/user-account-status.seed';

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  entities: [User, EnumValue, EnumType, Branch, Subject],
  synchronize: true,
});

async function runSeed() {
  await AppDataSource.initialize();
  // await seedUserRoleEnums(AppDataSource);
  // await seedUsers(AppDataSource);
  // await seedSemsEnum(AppDataSource);
  // await seedBranches(AppDataSource);
  // await seedSubjects(AppDataSource);
  // await seedAcademicYearEnums(AppDataSource);
  // await seedGenderEnums(AppDataSource);
  // await seedUserAccountStatusEnums(AppDataSource);
  console.log('----------------------------');
  console.log('Seeding completed');
  console.log('----------------------------');
  await AppDataSource.destroy();
}
runSeed();
