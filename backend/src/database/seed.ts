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
  await AppDataSource.destroy();
}
runSeed();
