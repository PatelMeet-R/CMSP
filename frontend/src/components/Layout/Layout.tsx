// import { AppSidebar } from "@/components/AppSidebar";
// import Footer from "@/components/Footer";
// import Topbar from "@/components/Topbar";
import { AppSidebar } from "@/components/AppSidebar";
import Footer from "@/components/Footer";
import Topbar from "@/components/Topbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
const Layout = () => {
  return (
    <SidebarProvider>
      <Topbar />
      <AppSidebar></AppSidebar>
      <main className="border border-green-600 w-full">
        <div className="w-full min-h-[calc(100vh-46px)]">
          <Outlet />
        </div>
        <Footer />
      </main>
    </SidebarProvider>
  );
};
export default Layout;
