import logo from "@/assets/01.png";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAppSelector } from "@/store/hook";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ROUTENAME } from "@/core/Constants/RouteName";

const Topbar = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    // <header className="flex justify-between items-center h-20 sticky top-0 z-50 bg-mist-100 px-5 border-b shrink-0">

    <header className="flex justify-between items-center h-16 shrink-0 bg-mist-100 px-5 border-b z-10 w-full">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="md:hidden" />
        <img src={logo} alt="logo" width={80} />
      </div>

      <div>
        {!isAuthenticated && (
          <Button asChild>
            <Link to={ROUTENAME.LOGIN} className="rounded-full">
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
};

export default Topbar;
