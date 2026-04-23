import { AppSidebar } from "@/components/Layout/AppSidebar";
import Footer from "@/components/Layout/Footer";
import Topbar from "@/components/Layout/Topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
const Layout = () => {
  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex flex-col h-svh overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 w-full max-w-[100vw] overflow-x-hidden">
            <Outlet />
          </main>
          <Footer />
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
};
export default Layout;
