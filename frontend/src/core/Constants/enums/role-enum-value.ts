export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  HOD: "HOD",
  PROFESSOR: "PROFESSOR",
  STUDENT: "STUDENT",
} as const;
export type RoleType = (typeof ROLES)[keyof typeof ROLES];
