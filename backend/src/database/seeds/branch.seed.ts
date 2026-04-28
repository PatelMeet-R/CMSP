import { Branch } from 'src/modules/branch/domain/entities/branch.entity';
import { DataSource } from 'typeorm';

export async function seedBranches(dataSource: DataSource) {
  const repo = dataSource.getRepository(Branch);

  const branches = [
    { name: 'System Administration', code: 'SYS', isSystem: true },

    // Your normal branches
    { name: 'Computer Engineering', code: 'CE', isSystem: false },
    { name: 'Information Technology', code: 'IT', isSystem: false },
    { name: 'Mechanical Engineering', code: 'ME', isSystem: false },
    {
      name: 'Electronics and Communication Engineering',
      code: 'EC',
      isSystem: false,
    },
    { name: 'Civil Engineering', code: 'CV', isSystem: false },
    { name: 'Electrical Engineering', code: 'EE', isSystem: false },
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
