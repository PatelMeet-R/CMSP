import { ROUTENAME } from "@/core/Constants/RouteName";

export type SidebarChild = {
  label: string;
  icon: string;
  link: string;
  permission?: string; // 🚨 Only use permission now
};

export type SidebarItem = {
  label: string;
  icon: string;
  children?: SidebarChild[];
  link?: string;
  permission?: string; // 🚨 Only use permission now
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
        permission: "subject:read",
      },
      {
        label: "Register Subject",
        icon: "FilePlusCorner",
        link: ROUTENAME.ADD_SUBJECT,
        permission: "subject:create",
      },
      {
        label: "Assign Subject",
        icon: "UserCog",
        link: ROUTENAME.ASSIGN_SUBJECT,
        permission: "subject-mapping:create",
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
        link: ROUTENAME.ASSIGNMENT,
        permission: "assignment:read",
      },
      {
        label: "Create Assignment",
        icon: "PlusCircle",
        link: ROUTENAME.ADD_ASSIGNMENT,
        permission: "assignment:create",
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
        permission: "branch:read",
      },
      {
        label: "Register Branch",
        icon: "FilePlusCorner",
        link: ROUTENAME.ADD_BRANCH,
        permission: "branch:create",
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
        permission: "user:read",
      },
      {
        label: "Register Staff",
        icon: "UserPlus",
        link: ROUTENAME.ADD_STAFF,
        permission: "user:create",
      },
    ],
  },
  {
    label: "Setting",
    icon: "Settings",
    link: ROUTENAME.SETTING,
    permission: "setting:manage",
  },
];
