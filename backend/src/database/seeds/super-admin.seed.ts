import { ConflictException } from '@nestjs/common';
import { hash } from 'bcrypt';
import { User } from 'src/modules/auth/domain/entities/user.entity';
import { Role } from 'src/modules/rbac/domain/entities/role.entity';
import { StaffProfile } from 'src/modules/users/domain/entities/staff-profile.entity';
import { EnumValue } from 'src/modules/enums/domain/entities/enumValue.entity';
import { PersonalInfo } from 'src/modules/users/domain/entities/personal-info.entity';
import { Branch } from 'src/modules/branch/domain/entities/branch.entity'; // 🚨 V2 IMPORT
import { DataSource } from 'typeorm';
import { ENUM_VALUES } from 'src/common/constants/enum-types.constant';

export async function seedAdminUser(dataSource: DataSource) {
  const userRepo = dataSource.getRepository(User);
  const roleRepo = dataSource.getRepository(Role);
  const enumRepo = dataSource.getRepository(EnumValue);
  const personalInfoRepo = dataSource.getRepository(PersonalInfo);
  const staffProfileRepo = dataSource.getRepository(StaffProfile);
  const branchRepo = dataSource.getRepository(Branch); // 🚨 Added Branch Repo

  const existingSuperAdmin = await userRepo.findOne({
    where: { email: 'meet333110@gmail.com' },
  });

  if (existingSuperAdmin) {
    console.log('Super Admin already exists. Skipping...');
    return;
  }

  const hashedPassword = await hash('normal_pass', 10);

  // 1. Fetch Role
  const role = await roleRepo.findOne({ where: { name: 'SUPER_ADMIN' } });
  if (!role) throw new Error('SUPER_ADMIN role not found.');

  // 2. Fetch Status
  const activeStatus = await enumRepo.findOne({
    where: {
      key: ENUM_VALUES.USER_ACC_STATUS.ACTIVE,
      type: { type: 'USER_ACCOUNT_STATUS' },
    },
  });
  if (!activeStatus) throw new Error('ACTIVE status not found.');

  //   FIX: Fetch Required Enums and Branch to satisfy DB constraints
  const gender = await enumRepo.findOne({
    where: { key: 'MALE', type: { type: 'GENDER' } },
  });
  const joinedYear = await enumRepo.findOne({
    where: { key: '2024', type: { type: 'ACADEMIC_YEAR' } },
  });
  const expectedGradYear = await enumRepo.findOne({
    where: { key: '2028', type: { type: 'ACADEMIC_YEAR' } },
  });

  // Assign Super Admin to the first branch (e.g., Computer Engineering).
  // Global guards will ignore this anyway, but the DB requires it.
  const adminBranch = await branchRepo.findOne({ where: { code: 'SYS' } });
  
  if (!gender || !joinedYear || !expectedGradYear || !adminBranch) {
    throw new Error(
      'Missing base dependencies (Gender, Year, or Branch) for Admin Profile.',
    );
  }

  // 4. Create Profile
  const adminProfile = personalInfoRepo.create({
    firstName: 'Super',
    lastName: 'Admin',
    enrollmentNumber: 'ADMIN_001', // Needs to be unique if there are constraints
    primaryMobileNumber: '0000000000',
    city: 'System',
    state: 'System',
    country: 'System',
    postalCode: '000000',
    userAccountStatus: activeStatus,
    branch: adminBranch, // 🚨 Database constraint satisfied
    gender: gender, // 🚨 Database constraint satisfied
    joinedAcademicYear: joinedYear, // 🚨 Database constraint satisfied
    expectedGraduateYear: expectedGradYear, // 🚨 Database constraint satisfied
  });

  const adminStaffProfile = staffProfileRepo.create({
    designation: 'SYSTEM',
    officeLocation: 'SERVER ROOM',
    joiningDate: new Date(),
    maxSubjectWorkload: 0,
  });

  const savedProfile = await personalInfoRepo.save(adminProfile);

  const superAdmin = userRepo.create({
    email: 'meet333110@gmail.com',
    password: hashedPassword,
    role: role,
    personalInfo: savedProfile,
    staffProfile: adminStaffProfile,
    lastLoginAt: new Date(),
  });

  await userRepo.save(superAdmin);
  console.log('-------------------------------------------------');
  console.log('Super Admin seeded successfully with all constraints met!');
  console.log('-------------------------------------------------');
}
