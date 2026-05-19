import { ROUTENAME } from "@/core/Constants/RouteName";
import type { SidebarItem } from "./DashboardSidebarConfig"; // 🚨 Import the unified type!

export const PROFILE_SIDEBAR_CONFIG: SidebarItem[] = [
  {
    label: "Account",
    icon: "UserCircle",
    children: [
      {
        label: "View Profile",
        icon: "UserPen",
        link: ROUTENAME.PROFILE,
        // No permission needed = visible to everyone
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
        // No permission needed = visible to everyone
      },
    ],
  },
];
