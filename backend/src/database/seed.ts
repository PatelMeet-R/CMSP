import { User } from 'src/modules/auth/domain/entities/user.entity';
import { DataSource } from 'typeorm';
import { seedUsers } from './seeds/super-admin.seed';
import 'dotenv/config';
import { seedEnums } from './seeds/role-enum.seed';
import { EnumValue } from 'src/modules/enums/domain/entities/enumValue.entity';
import { EnumType } from 'src/modules/enums/domain/entities/enumType.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  entities: [User, EnumValue, EnumType],
  synchronize: true,
});

async function runSeed() {
  await AppDataSource.initialize();
  // await seedEnums(AppDataSource);
  // await seedUsers(AppDataSource);
  await AppDataSource.destroy();
}
runSeed();
