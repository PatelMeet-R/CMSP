import { Branch } from 'src/modules/branch/domain/entities/branch.entity';
import { DataSource } from 'typeorm';

export async function seedBranches(dataSource: DataSource) {
  const repo = dataSource.getRepository(Branch);

  const branches = [
    { name: 'Computer Engineering', code: 'CE' },
    { name: 'Information Technology', code: 'IT' },
    { name: 'Mechanical Engineering', code: 'ME' },
    { name: 'Electronics and Communication Engineering', code: 'EC' },
    { name: 'Civil Engineering', code: 'CV' },
    { name: 'Electrical Engineering', code: 'EE' },
  ];

  for (const branch of branches) {
    const exists = await repo.findOne({
      where: { code: branch.code },
    });

    if (!exists) {
      const newBranch = repo.create(branch);
      await repo.save(newBranch);
    }
  }
  console.log('------------------------');
  console.log('Branch seeding completed');
  console.log('------------------------');
}
