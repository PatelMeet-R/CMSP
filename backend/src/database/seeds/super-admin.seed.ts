import { ConflictException } from '@nestjs/common';
import { hash } from 'bcrypt';
import { ERRORMESSAGE } from 'src/common/constants/error.message';
import { User } from 'src/modules/auth/domain/entities/user.entity';
import { EnumValue } from 'src/modules/enums/domain/entities/enumValue.entity';
import { DataSource } from 'typeorm';

export async function seedUsers(dataSource: DataSource) {
  const userRepo = dataSource.getRepository(User);
  const enumRepo = dataSource.getRepository(EnumValue);
  const existingSuperAdmin = await userRepo.findOne({
    where: {
      email: 'meet333110@gmail.com',
    },
  });
  if (existingSuperAdmin) {
    throw new ConflictException(ERRORMESSAGE.EMAIL_ALREADY_EXISTS);
  }
  const hashedPassword = await hash('admin123', 10);
  const role = await enumRepo.findOne({
    where: {
      key: 'SUPER_ADMIN',
    },
    relations: ['type'],
  });
  if (!role) {
    throw new Error('SUPER_ADMIN role not found');
  }

  const superAdmin = userRepo.create({
    email: 'meet333110@gmail.com',
    password: hashedPassword,
    role: role,
  });
  await userRepo.save(superAdmin);
  console.log(
    '--------------------------------------------------------------------------------admin seeded successfully------------------------------------------------------------------------------------------------------------',
  );
}
