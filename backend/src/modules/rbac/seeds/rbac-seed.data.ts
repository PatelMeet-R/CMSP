/**
 * Master permission registry for the CMS.
 * Format: { resource: [action1, action2, ...] }
 *
 * Rules:
 * - Use snake_case for multi-word resources (e.g. study_material)
 * - Actions are clean CRUD verbs + domain-specific actions
 * - Do NOT use route names (e.g. "getAll", "getById")
 */
export const PERMISSION_SEED: Record<string, string[]> = {
  assignment: ['create', 'read', 'update', 'delete', 'review', 'submit'],
  subject: ['create', 'read', 'update', 'delete', 'assign', 'unassign'],
  subject_mapping: ['create', 'read', 'update', 'delete'],
  branch: ['create', 'read', 'update'],
  user: [
    'create',
    'read',
    'update',
    'delete',
    'manage-role',
    'manage-status',
    'manage-permissions',
  ],
  profile: ['read', 'update', 'update-image'],
  staff: ['create', 'read', 'update'],
  file: ['upload', 'delete'],
  auth: ['register-staff'],
  settings: ['read', 'update'],
  role: ['create', 'read', 'update', 'delete'],
  permission: ['read'],
  study_material: ['create', 'read', 'update', 'delete'],
};

/**
 * Default role → permission mapping.
 * SUPER_ADMIN gets "*:*" which bypasses all checks in PermissionsGuard.
 */
export const ROLE_PERMISSION_SEED: Record<string, string[]> = {
  SUPER_ADMIN: ['*:*'],
  PENDING_USER: ['profile:read'],
  HOD: [
    // Assignment
    'assignment:create',
    'assignment:read',
    'assignment:update',
    'assignment:delete',
    'assignment:review',
    // Subject
    'subject:create',
    'subject:read',
    'subject:update',
    'subject:delete',
    'subject:assign',
    'subject:unassign',
    // Subject Mapping
    'subject_mapping:create',
    'subject_mapping:read',
    'subject_mapping:update',
    'subject_mapping:delete',
    // User Management
    'user:create',
    'user:read',
    'user:update',
    'user:manage-role',
    'user:manage-status',
    // Staff
    'staff:create',
    'staff:read',
    'staff:update',
    // Profile
    'profile:read',
    'profile:update',
    'profile:update-image',
    // File
    'file:upload',
    'file:delete',
    // Auth
    'auth:register-staff',
    // Settings
    'settings:read',
    'settings:update',
    // Branch (read only — cannot create/update branches)
    'branch:read',
    // Role (read only)
    'role:read',
  ],

  PROFESSOR: [
    // Assignment (CRUD + review)
    'assignment:create',
    'assignment:read',
    'assignment:update',
    'assignment:delete',
    'assignment:review',
    // Subject (read only)
    'subject:read',
    // Subject Mapping (read only)
    'subject_mapping:read',
    // User (read only)
    'user:read',
    // Profile (own)
    'profile:read',
    'profile:update',
    'profile:update-image',
    // Staff (read own)
    'staff:read',
    // File
    'file:upload',
    'file:delete',
    // Settings (read only)
    'settings:read',
    // Study Material
    'study_material:create',
    'study_material:read',
    'study_material:update',
    'study_material:delete',
  ],

  STUDENT: [
    // Assignment (read + submit only)
    'assignment:read',
    'assignment:submit',
    // Subject (read only)
    'subject:read',
    // User (read only)
    'user:read',
    // Profile (own)
    'profile:read',
    'profile:update',
    'profile:update-image',
    // File
    'file:upload',
    // Settings (read only)
    'settings:read',
    // Study Material (read only)
    'study_material:read',
  ],

  // LIBRARIAN starts empty — Super Admin assigns permissions dynamically
  LIBRARIAN: [],
};

/**
 * System role descriptions
 */
export const ROLE_DESCRIPTIONS: Record<string, string> = {
  SUPER_ADMIN: 'Full system access with wildcard permissions',
  HOD: 'Head of Department — manages branch-level operations',
  PROFESSOR: 'Faculty member — manages assignments and study materials',
  STUDENT: 'Student — submits assignments, views materials',
  LIBRARIAN: 'Library staff — manages library resources',
  PENDING_USER: 'Newly registered user awaiting Admin approval',
};
