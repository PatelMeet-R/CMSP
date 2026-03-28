import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { ROLES, type RoleType } from "@/core/Constants/enums/role-enum-value";
import { ROUTENAME } from "@/core/Constants/RouteName";
import { PROFILE_SIDEBAR_CONFIG } from "@/core/config/ProfileSidebar";

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
  // if (!user) {
  //   return null;
  // }
  // const userRole = user.role;
  const userRole = ROLES.SUPER_ADMIN;

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
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 transition-none hover:bg-accent hover:text-accent-foreground"
            >
              {/* Render the dynamic parent icon */}
              <ParentIcon className="w-4 h-4" />
              <span>{item.label}</span>
              {/* Chevron icon rotates when the collapsible opens */}
              <ChevronRightIcon className="ml-auto w-4 h-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
            </Button>
          </CollapsibleTrigger>

          {/* CHILDREN CONTENT */}
          <CollapsibleContent className="pl-6 pt-1">
            <div className="flex flex-col gap-1">
              {/* Map over the children array to render the sub-links */}
              {item.children.map((child: SidebarChild) => {
                // Get the child's specific icon
                const ChildIcon = IconMap[child.icon] || FileIcon;

                return (
                  <Button
                    key={child.link}
                    variant="ghost"
                    size="sm"
                    asChild
                    className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <Link to={child.link}>
                      <ChildIcon className="w-4 h-4" />
                      <span>{child.label}</span>
                    </Link>
                  </Button>
                );
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>
      );
    }

    //  RENDER ITEMS WITHOUT CHILDREN
    return (
      <Button
        key={item.label}
        variant="ghost"
        size="sm"
        asChild
        className="w-full justify-start gap-2 text-foreground"
      >
        <Link to={item.link || ""}>
          <ParentIcon className="w-4 h-4" />
          <span>{item.label}</span>
        </Link>
      </Button>
    );
  };
  return (
    <Card
      className="mx-auto w-full max-w-[16rem] gap-2 border-0 shadow-none"
      size="sm"
    >
      <CardContent className="p-4 pt-0">
        <div className="flex flex-col gap-1">
          {/* Start the rendering loop */}
          {filteredSidebarConfig.map((item) => renderSideBarItem(item))}
        </div>
      </CardContent>
    </Card>
  );
};
