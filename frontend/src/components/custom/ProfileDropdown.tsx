import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import usericon from "@/assets/usericon.png";
import { LogOutIcon, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/store/hook";
import { logoutUser } from "@/modules/auth/model/authService";
import { ROUTENAME } from "@/core/Constants/RouteName";
import { logout } from "@/store/features/auth.slice";

export const ProfileDropdown = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();

    dispatch(logout());

    navigate(ROUTENAME.LOGIN);
  };

  return (
    <DropdownMenu>
      {/* ------------------TRIGGER ----------------*/}
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="p-1 md:p-2 h-auto w-auto rounded-full! overflow-hidden hover:scale-105 transition-transform"
        >
          <Avatar
            className="
              h-10 w-10 
              md:h-12 md:w-12 
              lg:h-14 lg:w-14 
              rounded-full overflow-hidden 
              border-2 border-primary 
              shadow-sm
            "
          >
            <AvatarImage
              src={usericon}
              alt="user"
              className="w-full h-full object-cover"
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      {/* ---------------- DROPDOWN --------------*/}
      <DropdownMenuContent
        align="end"
        className="w-56 p-2 mt-3 sm:mt-1.5 md:mt-0.5"
      >
        <DropdownMenuLabel className="px-2 py-1.5">
          <p className="text-xs font-medium truncate">
            {user?.email || "example@gmail.com"}
          </p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link
            to="/profile"
            className="flex items-center gap-2 cursor-pointer"
          >
            <UserIcon className="h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="text-red-500 focus:text-red-500 cursor-pointer"
          onClick={handleLogout}
        >
          <LogOutIcon className="h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
