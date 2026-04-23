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

export const PROFILE_SIDEBAR_CONFIG: SidebarItem[] = [
  {
    label: "Account",
    icon: "UserCircle",
    children: [
      {
        label: "View Profile",
        icon: "UserPen",
        link: ROUTENAME.PROFILE,
        allowedRoles: [
          ROLES.SUPER_ADMIN,
          ROLES.HOD,
          ROLES.PROFESSOR,
          ROLES.STUDENT,
        ],
      },
    ],
  },
  {
    label: "Security",
    icon: "ShieldCheck",
    children: [
      {
        label: "Reset Password",
        icon: "KeyRound",
        link: ROUTENAME.RESET_PASSWORD,
        allowedRoles: [
          ROLES.SUPER_ADMIN,
          ROLES.HOD,
          ROLES.PROFESSOR,
          ROLES.STUDENT,
        ],
      },
    ],
  },
];
