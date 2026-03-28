import { AppSidebar } from "@/components/Layout/AppSidebar";
import Footer from "@/components/Layout/Footer";
import Topbar from "@/components/Layout/Topbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
const Layout = () => {
  return (
    <SidebarProvider>
      <Topbar />
      <AppSidebar />
      <main className="w-full pt-16 flex flex-col min-h-screen">
        <div className="flex-1 p-6">
          <Outlet />
        </div>
        <Footer />
      </main>
    </SidebarProvider>
  );
};
export default Layout;
