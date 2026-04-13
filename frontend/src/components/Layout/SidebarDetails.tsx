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
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  DASHBOARD_SIDEBAR_CONFIG,
  type SidebarItem,
  type SidebarChild,
} from "@/core/config/DashboardSidebarConfig";
import { useAppSelector } from "@/store/hook";
import { type RoleType } from "@/core/Constants/enums/role-enum-value";
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
};

export const DashboardSideBarDetails = () => {
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  if (!user) {
    return null;
  }
  const userRole = user.role;

  const isProfileRoute = location.pathname.includes(ROUTENAME.PROFILE);

  const activeConfig = isProfileRoute
    ? PROFILE_SIDEBAR_CONFIG
    : DASHBOARD_SIDEBAR_CONFIG;

  //THE FILTERING
  const filteredSidebarConfig = activeConfig
    .map((parentCategory) => {
      //  Keep only the children this specific role is allowed to see
      const allowedChildren =
        parentCategory.children?.filter((child) =>
          child.allowedRoles.includes(userRole as RoleType),
        ) || [];
      //  Return the parent with the newly filtered children array
      return {
        ...parentCategory,
        children: allowedChildren,
      };
    })
    .filter((parentCategory) => {
      return parentCategory.children && parentCategory.children.length > 0;
    });

  const renderSideBarItem = (item: SidebarItem) => {
    //  GET THE DYNAMIC ICON

    const ParentIcon = IconMap[item.icon] || FolderIcon;

    //  CHECK FOR CHILDREN
    if (item.children && item.children.length > 0) {
      return (
        //  Chevron icon know when this specific item is open
        <Collapsible key={item.label} className="group/collapsible">
          {/* PARENT BUTTON (Trigger) */}
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              {/* tooltip={item.label} shows the text when hovering in icon-only mode! */}
              <SidebarMenuButton>
                <ParentIcon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
                <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>

            {/* CHILDREN CONTENT */}
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

    //  RENDER ITEMS WITHOUT CHILDREN
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
