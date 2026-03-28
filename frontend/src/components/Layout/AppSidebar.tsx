import { DashboardSideBarDetails } from "@/components/Layout/SidebarDetails";
import { Sidebar, SidebarContent, SidebarGroup } from "@/components/ui/sidebar";

export function AppSidebar() {
  return (
    <Sidebar className="top-20 h-[calc(100svh-4rem)]!">
      <SidebarContent>
        <SidebarGroup>
          <DashboardSideBarDetails />
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
