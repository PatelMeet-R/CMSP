import { ConflictException } from '@nestjs/common';
import { hash } from 'bcrypt';
import { ERRORMESSAGE } from 'src/common/constants/error.message';
import { ROLES } from 'src/common/constants/roles.constant';
import { User } from 'src/modules/auth/domain/entities/user.entity';
import { EnumValue } from 'src/modules/enums/domain/entities/enumValue.entity';
import { PersonalInfo } from 'src/modules/users/domain/entities/personal-info.entity';
import { DataSource } from 'typeorm';

export async function seedAdminUser(dataSource: DataSource) {
  const userRepo = dataSource.getRepository(User);
  const enumRepo = dataSource.getRepository(EnumValue);
  const personalInfoRepo = dataSource.getRepository(PersonalInfo);

  const existingSuperAdmin = await userRepo.findOne({
    where: { email: 'meet333110@gmail.com' },
  });

  if (existingSuperAdmin) {
    throw new ConflictException(ERRORMESSAGE.EMAIL_ALREADY_EXISTS);
  }

  const hashedPassword = await hash('normal_pass', 10);

  const role = await enumRepo.findOne({
    where: { key: ROLES.SUPER_ADMIN },
    relations: ['type'],
  });

  if (!role) {
    throw new Error('SUPER_ADMIN role not found');
  }

  const adminProfile = personalInfoRepo.create({
    firstName: 'Super',
    lastName: 'Admin',
    enrollmentNumber: 'NOT_REQUIRED',
    primaryMobileNumber: '0000000000',
    city: 'System',
    state: 'System',
    country: 'System',
    postalCode: '000000',
  });

  const savedProfile = await personalInfoRepo.save(adminProfile);

  const superAdmin = userRepo.create({
    email: 'meet333110@gmail.com',
    password: hashedPassword,
    role: role,
    personalInfo: savedProfile,
  });

  await userRepo.save(superAdmin);
  console.log('----------------admin seeded successfully----------------');
}
