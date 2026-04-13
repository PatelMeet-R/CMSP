import { ROLES, type RoleType } from "@/core/Constants/enums/role-enum-value";
import { ROUTENAME } from "@/core/Constants/RouteName";
export type SidebarChild = {
  label: string;
  icon: string;
  link: string;
  allowedRoles: RoleType[];
};
export type SidebarItem = {
  label: string;
  icon: string;
  children?: SidebarChild[];
  link?: string;
};

export const DASHBOARD_SIDEBAR_CONFIG: SidebarItem[] = [
  {
    label: "Subjects",
    icon: "BookOpen",
    children: [
      {
        label: "View Subjects",
        icon: "Eye",
        link: ROUTENAME.SUBJECTS, 
        allowedRoles: [
          ROLES.SUPER_ADMIN,
          ROLES.HOD,
          ROLES.PROFESSOR,
          ROLES.STUDENT,
        ],
      },
      {
        label: "Register Subject",
        icon: "FilePlusCorner",
        link: ROUTENAME.ADD_SUBJECT,
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.HOD],
      },
      {
        label: "Assign Subject",
        icon: "UserCog",
        link: ROUTENAME.PROFESSOR_ASSIGN_SUBJECT_POST,
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.HOD],
      },
      {
        label: "View Assignments (Subject)",
        icon: "List",
        link: ROUTENAME.PROFESSOR_ASSIGNED_SUBJECT_GET,
        //  "/professor-subject/all",
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.HOD],
      },
    ],
  },
  {
    label: "Assignments",
    icon: "GraduationCap",
    children: [
      {
        label: "View Assignments",
        icon: "Eye",
        link: ROUTENAME.ASSIGNMENT, // Replaces: /assignment/all
        allowedRoles: [
          ROLES.SUPER_ADMIN,
          ROLES.HOD,
          ROLES.PROFESSOR,
          ROLES.STUDENT,
        ],
      },
      {
        label: "Create Assignment",
        icon: "PlusCircle",
        link: ROUTENAME.ADD_ASSIGNMENT,
        allowedRoles: [ROLES.HOD, ROLES.PROFESSOR],
      },
      {
        label: "My Assignments",
        icon: "User",
        link: ROUTENAME.MY_ASSIGNMENT,
        allowedRoles: [ROLES.PROFESSOR],
      },
    ],
  },
  {
    label: "Branches",
    icon: "GitBranch",
    children: [
      {
        label: "View Branches",
        icon: "Eye",
        link: ROUTENAME.BRANCH,
        // "/branch/all", // needs: updated this from your file where it said "/subject" under branch
        allowedRoles: [ROLES.SUPER_ADMIN],
      },
      {
        label: "Register Branch",
        icon: "FilePlusCorner",
        link: ROUTENAME.ADD_BRANCH,
        allowedRoles: [ROLES.SUPER_ADMIN],
      },
    ],
  },
  {
    label: "Users & Management",
    icon: "Users",
    children: [
      {
        label: "View All Users",
        icon: "Eye",
        link: ROUTENAME.ALL_USERS,
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.HOD,ROLES.PROFESSOR,ROLES.STUDENT],
      },

      {
        label: "Register Staff",
        icon: "UserPlus",
        link: ROUTENAME.ADD_STAFF,
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.HOD],
      },
    ],
  },
];
