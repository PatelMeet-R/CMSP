export interface SuperAdminMetrics {
  type: "SUPER_ADMIN";
  stats: { totalUsers: number; totalRoles: number; activeSessions: number };
  roleDistribution: { name: string; value: number }[];
  recentActivity: { id: string; action: string; user: string; date: string }[];
}

export interface HodMetrics {
  type: "HOD";
  stats: { totalAllocations: number; pendingApprovals: number };
}

export interface ProfessorMetrics {
  type: "PROFESSOR";
  stats: { totalSubjects: number };
  mySubjects: { id: string; name: string; code: string; semester: string }[];
}

export type DashboardMetricsResponse =
  | SuperAdminMetrics
  | HodMetrics
  | ProfessorMetrics;
