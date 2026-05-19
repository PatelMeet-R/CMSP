import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/modules/auth/domain/entities/user.entity';
import { Role } from 'src/modules/rbac/domain/entities/role.entity';
import { AuditLog } from 'src/modules/users/domain/entities/audit-log.entity';
import { ProfessorSubMapping } from 'src/modules/subject/domain/entities/professors-subject.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    @InjectRepository(ProfessorSubMapping)
    private readonly profSubRepo: Repository<ProfessorSubMapping>,
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  /**
   * Master function to get metrics based on the user's role
   */
  async getDashboardMetrics(user: any) {
    const roleName = user.role; // Extracted from your JwtStrategy/CurrentUser decorator

    if (roleName === 'SUPER_ADMIN') {
      return this.getSuperAdminMetrics();
    } else if (roleName === 'HOD') {
      return this.getHodMetrics(user.id, user.branchId);
    } else if (roleName === 'PROFESSOR') {
      return this.getProfessorMetrics(user.id);
    }

    // Default fallback for students or unassigned users
    return {
      role: roleName,
      message: 'Welcome to the College Management System',
    };
  }

  // ==========================================
  // ROLE-SPECIFIC QUERIES
  // ==========================================

  private async getSuperAdminMetrics() {
    // Run queries in parallel for maximum performance
    const [totalUsers, totalRoles, recentAudits, roleDistribution] =
      await Promise.all([
        this.userRepo.count(),
        this.roleRepo.count(),
        this.auditRepo.find({
          relations: ['actor', 'actor.personalInfo'],
          order: { createdAt: 'DESC' },
          take: 10,
          select: {
            id: true,
            action: true,
            details: true,
            createdAt: true,
            actor: {
              id: true,
              email: true,
              personalInfo: {
                firstName: true,
                lastName: true,
              },
            },
          },
        }),

        // Get a count of users grouped by their role using QueryBuilder
        this.userRepo
          .createQueryBuilder('user')
          .leftJoin('user.role', 'role')
          .select('role.name', 'roleName')
          .addSelect('COUNT(user.id)', 'count')
          .groupBy('role.name')
          .getRawMany(),
      ]);

    return {
      type: 'SUPER_ADMIN',
      stats: {
        totalUsers,
        totalRoles,
        activeSessions: Math.floor(Math.random() * 50) + 10, // Placeholder if you don't track active sessions yet
      },
      roleDistribution: roleDistribution.map((item) => ({
        name: item.roleName || 'Unassigned',
        value: parseInt(item.count, 10),
      })),
      recentActivity: recentAudits.map((audit) => ({
        id: audit.id,
        action: audit.action,
        user: audit.actor?.email || 'System',
        date: audit.createdAt,
      })),
    };
  }

  private async getHodMetrics(userId: string, branchId: string) {
    // Count how many subject mappings exist for professors in this HOD's branch
    const totalAllocations = await this.profSubRepo.count({
      // Add where clauses specific to the branch if your mapping supports it
    });

    return {
      type: 'HOD',
      stats: {
        totalAllocations,
        pendingApprovals: 0,
      },
    };
  }

  private async getProfessorMetrics(professorId: string) {
    // Fetch the subjects assigned to this specific professor
    const assignedSubjects = await this.profSubRepo.find({
      where: { professor: { id: professorId } },
      relations: ['subject', 'semester', 'academicYear'],
    });

    return {
      type: 'PROFESSOR',
      stats: {
        totalSubjects: assignedSubjects.length,
      },
      mySubjects: assignedSubjects.map((sub) => ({
        id: sub.id,
        name: sub.subject.name,
        code: sub.subject.code,
        semester: sub.semester.value,
      })),
    };
  }
}
