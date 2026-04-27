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
import { seedAdminUser } from 'src/database/seeds/updated-super-admin.seed';
import { PersonalInfo } from 'src/modules/users/domain/entities/personal-info.entity';
import { File } from 'src/modules/file-upload/domain/entity/file.entity';
import { StaffProfile } from 'src/modules/users/domain/entities/staff-profile.entity';
import { Role } from 'src/modules/rbac/domain/entities/role.entity';
import { Permission } from 'src/modules/rbac/domain/entities/permission.entity';
import { UserPermission } from 'src/modules/rbac/domain/entities/user-permission.entity';
import { seedRbac } from 'src/modules/rbac/seeds/rbac-seed.runner';


const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  // ssl: { rejectUnauthorized: false },
  ssl: false,
  extra: {
    ssl: false, // 🔥 force pg driver
  },

  entities: [
    User,
    EnumValue,
    EnumType,
    Branch,
    Subject,
    PersonalInfo,
    File,
    StaffProfile,
    Role,
    Permission,
    UserPermission,
  ],
  synchronize: true,
});

async function runSeed() {
  await AppDataSource.initialize();
  await seedRbac(AppDataSource);



  // await seedUserRoleEnums(AppDataSource);
  // await seedSemsEnum(AppDataSource);
  // await seedBranches(AppDataSource);
  // await seedSubjects(AppDataSource);
  // await seedAcademicYearEnums(AppDataSource);
  // await seedGenderEnums(AppDataSource);
  // await seedUserAccountStatusEnums(AppDataSource);
  // await seedAdminUser(AppDataSource);
  console.log('----------------------------');
  console.log('Seeding completed');
  console.log('----------------------------');
  await AppDataSource.destroy();
}
runSeed();
