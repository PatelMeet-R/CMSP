import logo from "@/assets/01.png";
import { LogIn, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useSidebar } from "@/components/ui/sidebar";
import { useAppSelector } from "@/store/hook";
import { ProfileDropdown } from "@/components/custom/ProfileDropdown";

const Topbar = () => {
  const { toggleSidebar } = useSidebar();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  return (
    <div className="flex justify-between items-center h-20 fixed w-full z-50 bg-mist-100 px-5 border-b">
      <div className="flex items-center gap-4">
        <img src={logo} alt="logo" width={80} />
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="md:block"
          aria-label="Toggle Sidebar"
        >
          <PanelLeft className="h-5 w-5" />
        </Button>
      </div>

      <div>
        {!isAuthenticated ? (
          <Button asChild>
            <Link to="/login" className="rounded-full">
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Link>
          </Button>
        ) : (
          <ProfileDropdown />
        )}
      </div>
    </div>
  );
};

export default Topbar;
