// import { EnumType } from 'src/modules/enums/domain/entities/enumType.entity';
// import { EnumValue } from 'src/modules/enums/domain/entities/enumValue.entity';
// import { DataSource } from 'typeorm';

import { EnumType } from 'src/modules/enums/domain/entities/enumType.entity';
import { EnumValue } from 'src/modules/enums/domain/entities/enumValue.entity';
import { DataSource } from 'typeorm';

export async function seedAcademicYearEnums(dataSource: DataSource) {
  const enumTypeRepo = dataSource.getRepository(EnumType);
  const enumValueRepo = dataSource.getRepository(EnumValue);

  let type = await enumTypeRepo.findOne({
    where: { type: 'ACADEMIC_YEAR' },
  });

  if (!type) {
    type = await enumTypeRepo.save({
      type: 'ACADEMIC_YEAR',
    });
  }

  const values = ['2024', '2025', '2026', '2027'];

  for (const year of values) {
    const exists = await enumValueRepo.findOne({
      where: { key: year, type: { id: type.id } },
      relations: ['type'],
    });

    if (!exists) {
      await enumValueRepo.save({
        key: year,
        value: year,
        type: type,
      });
    }
  }
}
