import logo from "@/assets/01.png";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import SearchBox from "@/components/SearchBox";

const Topbar = () => {
  return (
    <div className="flex justify-between items-center h-16 fixed w-full z-20 bg-red-700 px-5 border-b">
      <div>
        <img src={logo} alt="logo" width={80} />
      </div>
      <div className="w-125">
        <SearchBox />
      </div>
      <div>
        <Button asChild>
          <Link to="" className="rounded-full">
            <LogIn /> Sign In
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default Topbar;
