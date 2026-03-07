import { EnumType } from 'src/modules/enums/domain/entities/enumType.entity';
import { EnumValue } from 'src/modules/enums/domain/entities/enumValue.entity';
import { DataSource } from 'typeorm';

export async function seedEnums(dataSource: DataSource) {
  const enumTypeRepo = dataSource.getRepository(EnumType);
  const enumValueRepo = dataSource.getRepository(EnumValue);

  const roleType = await enumTypeRepo.save({
    type: 'USER_ROLE',
  });

  await enumValueRepo.save([
    { key: 'STUDENT', value: 'user', type: roleType },
    { key: 'PROFESSOR', value: 'professor', type: roleType },
    { key: 'HOD', value: 'hod', type: roleType },
    { key: 'SUPER_ADMIN', value: 'super_admin', type: roleType },
  ]);
}
