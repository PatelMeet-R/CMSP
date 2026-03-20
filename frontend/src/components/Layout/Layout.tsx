import { AppSidebar } from "@/components/Layout/AppSidebar";
import Footer from "@/components/Layout/Footer";
import Topbar from "@/components/Layout/Topbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
const Layout = () => {
  return (
    <SidebarProvider>
      <Topbar />
      <AppSidebar></AppSidebar>
      <main className="border w-full">
        <div className="w-full min-h-[calc(100vh-46px)]">
          <Outlet />
        </div>
        <Footer />
      </main>
    </SidebarProvider>
  );
};
export default Layout;
