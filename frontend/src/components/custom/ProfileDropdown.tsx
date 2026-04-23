import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LogOutIcon,
  UserIcon,
  ChevronsUpDown,
  LayoutDashboard,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/store/hook";
import { logoutUser } from "@/modules/auth/model/authService";
import { ROUTENAME } from "@/core/Constants/RouteName";
import { logout } from "@/store/features/auth.slice";

import { SidebarMenuButton } from "@/components/ui/sidebar";
import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@/modules/users/profile/model/profileService";

export const ProfileDropdown = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isProfilePage = location.pathname === ROUTENAME.PROFILE;

  const { data: profile } = useQuery({
    queryKey: ["profile", "me"],
    queryFn: getProfile,
    staleTime: 5 * 60 * 1000, // 5 min
  });

  const handleLogout = async () => {
    await logoutUser();
    dispatch(logout());
    navigate(ROUTENAME.LOGIN);
  };

  const imageUrl = profile?.profileImageUrl || undefined;
  const userEmail = user?.email || "example@gmail.com";
  const initials = userEmail.substring(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      {/* ------------------ TRIGGER ----------------*/}
      <DropdownMenuTrigger asChild>
        {/*  Changed to SidebarMenuButton for perfect sidebar integration */}
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground bg-gray-100"
        >
          <Avatar className="h-8 w-8 rounded-lg border border-primary/20">
            <AvatarImage src={imageUrl} alt="user" className="object-cover" />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          {/* This text div automatically hides when the sidebar collapses! */}
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate text-xs text-muted-foreground">
              {userEmail}
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
              <AvatarImage src={imageUrl} alt="user" className="object-cover" />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate text-xs">{userEmail}</span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          {isProfilePage ? (
            <Link
              to={ROUTENAME.DASHBOARD} // <-- Change
              className="flex items-center gap-2 cursor-pointer"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          ) : (
            <Link
              to={ROUTENAME.PROFILE}
              className="flex items-center gap-2 cursor-pointer"
            >
              <UserIcon className="h-4 w-4" />
              Profile
            </Link>
          )}
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
