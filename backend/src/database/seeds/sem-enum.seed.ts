import { ConflictException } from '@nestjs/common';
import { ENUM_TYPES } from 'src/common/constants/enum-types.constant';
import { ERRORMESSAGE } from 'src/common/constants/error.message';
import { EnumType } from 'src/modules/enums/domain/entities/enumType.entity';
import { EnumValue } from 'src/modules/enums/domain/entities/enumValue.entity';
import { DataSource } from 'typeorm';

export async function seedSemsEnum(dataSource: DataSource) {
  const enumTypeRepo = dataSource.getRepository(EnumType);
  const enumValueRepo = dataSource.getRepository(EnumValue);

  let semType = await enumTypeRepo.findOne({
    where: { type: ENUM_TYPES.SEMESTER },
  });
  if (semType) {
    throw new ConflictException(ERRORMESSAGE.ENUMTYPE_ALREADY_EXISTS);
  }
  const SEM_ENUM_Type = await enumTypeRepo.save({
    type: ENUM_TYPES.SEMESTER,
  });

  await enumValueRepo.save([
    { key: 'SEM01', value: '1', type: SEM_ENUM_Type },
    { key: 'SEM02', value: '2', type: SEM_ENUM_Type },
    { key: 'SEM03', value: '3', type: SEM_ENUM_Type },
    { key: 'SEM04', value: '4', type: SEM_ENUM_Type },
    { key: 'SEM05', value: '5', type: SEM_ENUM_Type },
    { key: 'SEM06', value: '6', type: SEM_ENUM_Type },
    { key: 'SEM07', value: '7', type: SEM_ENUM_Type },
    { key: 'SEM08', value: '8', type: SEM_ENUM_Type },
  ]);
}
