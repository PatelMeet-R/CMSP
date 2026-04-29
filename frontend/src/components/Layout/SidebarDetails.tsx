import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
  ChevronRightIcon,
  FileIcon,
  FolderIcon,
  BookOpen,
  Eye,
  FilePlusCorner,
  UserCog,
  List,
  GraduationCap,
  PlusCircle,
  User,
  GitBranch,
  Users,
  UserPen,
  UserCircle,
  ShieldCheck,
  KeyRound,
  MailCheck,
  Settings,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  DASHBOARD_SIDEBAR_CONFIG,
  type SidebarItem,
  type SidebarChild,
} from "@/core/config/DashboardSidebarConfig";
import { ROUTENAME } from "@/core/Constants/RouteName";
import { PROFILE_SIDEBAR_CONFIG } from "@/core/config/ProfileSidebar";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

// 🚨 V2: Import usePermissions instead of roles!
import { usePermissions } from "@/hooks/usePermissions";

const IconMap: Record<string, React.ElementType> = {
  BookOpen,
  Eye,
  FilePlusCorner,
  UserCog,
  List,
  GraduationCap,
  PlusCircle,
  User,
  GitBranch,
  Users,
  UserPen,
  UserCircle,
  ShieldCheck,
  KeyRound,
  MailCheck,
  Settings,
};

export const DashboardSideBarDetails = () => {
  const location = useLocation();

  // 🚨 V2 PBAC: We don't need user.role anymore!
  const { hasPermission } = usePermissions();

  const isProfileRoute = location.pathname.includes(ROUTENAME.PROFILE);

  const activeConfig = isProfileRoute
    ? PROFILE_SIDEBAR_CONFIG
    : DASHBOARD_SIDEBAR_CONFIG;

  // 🚨 V2 FILTERING LOGIC
  const filteredSidebarConfig = activeConfig
    .map((parentCategory) => {
      // 1. Filter the children based on permissions
      if (parentCategory.children) {
        const allowedChildren = parentCategory.children.filter((child) => {
          // If no permission is required, everyone sees it. Otherwise, check PBAC.
          return !child.permission || hasPermission(child.permission);
        });
        return {
          ...parentCategory,
          children: allowedChildren,
        };
      }
      return parentCategory;
    })
    .filter((parentCategory) => {
      // 2. Keep the parent if it has valid children left over
      const hasValidChildren =
        parentCategory.children && parentCategory.children.length > 0;

      // 3. Or, keep it if it's a direct link (like Settings) and the user has permission
      const isAllowedDirectLink =
        parentCategory.link &&
        (!parentCategory.permission ||
          hasPermission(parentCategory.permission));

      return hasValidChildren || isAllowedDirectLink;
    });

  const renderSideBarItem = (item: SidebarItem) => {
    const ParentIcon = IconMap[item.icon] || FolderIcon;

    if (item.children && item.children.length > 0) {
      return (
        <Collapsible key={item.label} className="group/collapsible">
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton>
                <ParentIcon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
                <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <SidebarMenuSub>
                {item.children.map((child: SidebarChild) => {
                  const ChildIcon = IconMap[child.icon] || FileIcon;
                  return (
                    <SidebarMenuSubItem key={child.link}>
                      <SidebarMenuSubButton asChild>
                        <Link to={child.link}>
                          <ChildIcon />
                          <span>{child.label}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  );
                })}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      );
    }

    return (
      <SidebarMenuItem key={item.label}>
        <SidebarMenuButton asChild>
          <Link to={item.link || ""}>
            <ParentIcon className={"w-5 h-5 shrink-0"} />
            <span>{item.label}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <SidebarGroup>
      <SidebarMenu>
        {filteredSidebarConfig.map((item) => renderSideBarItem(item))}
      </SidebarMenu>
    </SidebarGroup>
  );
};
