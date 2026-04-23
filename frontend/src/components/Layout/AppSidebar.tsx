import { ProfileDropdown } from "@/components/custom/ProfileDropdown";
import { DashboardSideBarDetails } from "@/components/Layout/SidebarDetails";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  return (
    <Sidebar
      collapsible="icon"
      className="top-20 h-[calc(100svh-4rem)]!  group/sidebar z-40"
    >
      <SidebarContent>
        <DashboardSideBarDetails />
      </SidebarContent>
      <SidebarFooter className="mb-0 md:mb-4">
        <SidebarMenu>
          <SidebarMenuItem className="hidden md:block">
            <SidebarMenuButton onClick={toggleSidebar}>
              {state === "expanded" ? (
                <PanelLeftClose className="w-5 h-5 shrink-0" />
              ) : (
                <PanelLeftOpen className="w-5 h-5 shrink-0" />
              )}
              <span>{state === "expanded" ? "Collapse menu" : "Pin menu"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <ProfileDropdown />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail className="w-2 hover:w-3 bg-transparent transition-all" />
    </Sidebar>
  );
}
