import { DataSource } from 'typeorm';
import { Permission } from '../domain/entities/permission.entity';
import { Role } from '../domain/entities/role.entity';
import {
  PERMISSION_SEED,
  ROLE_PERMISSION_SEED,
  ROLE_DESCRIPTIONS,
} from './rbac-seed.data';

/**
 * Seeds permissions and roles into the database.
 * Safe to run multiple times — skips existing entries.
 *
 * Usage: Call from your main seed.ts or from an OnApplicationBootstrap hook.
 */
export async function seedRbac(dataSource: DataSource): Promise<void> {
  const permRepo = dataSource.getRepository(Permission);
  const roleRepo = dataSource.getRepository(Role);

  // ── Step 1: Seed Permissions ──────────────────────────────────
  console.log('[RBAC Seed] Seeding permissions...');
  const allPermissions: Permission[] = [];

  for (const [resource, actions] of Object.entries(PERMISSION_SEED)) {
    for (const action of actions) {
      const slug = `${resource}:${action}`;
      let perm = await permRepo.findOne({ where: { slug } });

      if (!perm) {
        perm = permRepo.create({
          resource,
          action,
          slug,
          description: `${action} ${resource}`,
        });
        perm = await permRepo.save(perm);
        console.log(`  [+] Created permission: ${slug}`);
      }

      allPermissions.push(perm);
    }
  }

  // Also create the wildcard permission for SUPER_ADMIN
  let wildcardPerm = await permRepo.findOne({ where: { slug: '*:*' } });
  if (!wildcardPerm) {
    wildcardPerm = permRepo.create({
      resource: '*',
      action: '*',
      slug: '*:*',
      description: 'Full system access (wildcard)',
    });
    wildcardPerm = await permRepo.save(wildcardPerm);
    console.log(`  [+] Created permission: *:*`);
  }
  allPermissions.push(wildcardPerm);

  // ── Step 2: Seed Roles with Permissions ───────────────────────
  console.log('[RBAC Seed] Seeding roles...');

  for (const [roleName, permSlugs] of Object.entries(ROLE_PERMISSION_SEED)) {
    let role = await roleRepo.findOne({
      where: { name: roleName },
      relations: ['permissions'],
    });

    if (!role) {
      role = roleRepo.create({
        name: roleName,
        description: ROLE_DESCRIPTIONS[roleName] || '',
        isSystem: true,
        permissions: [],
      });
    }

    // Map slug strings to Permission entities
    role.permissions = permSlugs
      .map((slug) => allPermissions.find((p) => p.slug === slug))
      .filter((p): p is Permission => p !== undefined);

    await roleRepo.save(role);
    console.log(
      `  [+] Role "${roleName}" → ${role.permissions.length} permissions`,
    );
  }
  console.log('----------------------------');
  console.log('[RBAC Seed] Done!');
  console.log('RBAC Seeding completed');
  console.log('----------------------------');
}
