import { EnumType } from 'src/modules/enums/domain/entities/enumType.entity';
import { EnumValue } from 'src/modules/enums/domain/entities/enumValue.entity';
import { DataSource } from 'typeorm';

export async function seedGenderEnums(dataSource: DataSource) {
  const enumTypeRepo = dataSource.getRepository(EnumType);
  const enumValueRepo = dataSource.getRepository(EnumValue);

  let type = await enumTypeRepo.findOne({
    where: { type: 'GENDER' },
  });

  if (!type) {
    type = await enumTypeRepo.save({
      type: 'GENDER',
    });
  }

  const values = ['MALE', 'FEMALE', 'OTHER'];

  for (const v of values) {
    const exists = await enumValueRepo.findOne({
      where: { key: v, type: { id: type.id } },
      relations: ['type'],
    });

    if (!exists) {
      await enumValueRepo.save({
        key: v,
        value: v,
        type: type,
      });
    }
  }
}
