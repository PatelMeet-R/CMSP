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
import { LogOutIcon, UserIcon, ChevronsUpDown } from "lucide-react"; // 🚀 Added ChevronsUpDown
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/store/hook";
import { logoutUser } from "@/modules/auth/model/authService";
import { ROUTENAME } from "@/core/Constants/RouteName";
import { logout } from "@/store/features/auth.slice";

// 🚀 Import SidebarMenuButton
import { SidebarMenuButton } from "@/components/ui/sidebar";

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
      {/* ------------------ TRIGGER ----------------*/}
      <DropdownMenuTrigger asChild>
        {/* 🚀 Changed to SidebarMenuButton for perfect sidebar integration */}
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground bg-gray-100"
        >
          <Avatar className="h-8 w-8 rounded-lg border border-primary/20">
            <AvatarImage src={usericon} alt="user" className="object-cover" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>

          {/* This text div automatically hides when the sidebar collapses! */}
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate text-xs text-muted-foreground">
              {user?.email || "example@gmail.com"}
            </span>
          </div>

          <ChevronsUpDown className="ml-auto size-4" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>

      {/* ---------------- DROPDOWN --------------*/}
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        side="bottom"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={usericon} alt="user" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate text-xs">
                {user?.email || "example@gmail.com"}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link
            to={ROUTENAME.PROFILE}
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
          <LogOutIcon className="h-4 w-4 mr-2" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
