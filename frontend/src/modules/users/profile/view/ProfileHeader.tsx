import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Camera, Mail, Building2, Fingerprint } from "lucide-react";
import { useProfileViewModel } from "../viewModel/useProfileViewModel";
import { AvatarUploader } from "@/modules/users/profile/view/avatar-uploader";
import type { ProfileResponse } from "@/modules/users/types/users.schemas";

function getStatusStyles(status: string | undefined) {
  switch (status) {
    case "ACTIVE":
    case "Active":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800";
    case "BLOCKED":
    case "SUSPENDED":
      return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800";
    default:
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800";
  }
}

export default function ProfileHeader({ user }: { user: ProfileResponse }) {
  const { uploadAvatar, removeAvatar } = useProfileViewModel();

  const initials =
    `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();

  //   ViewModel Handlers
  const handleImageUpload = async (file: File) => {
    await uploadAvatar(file);
  };

  const handleImageRemove = async () => {
    await removeAvatar();
  };
  const displayStatus =
    typeof user.accountStatus === "string"
      ? user.accountStatus
      : user.accountStatus?.value || "Unknown";

  const profileRoleString =
    typeof user.role === "string" ? user.role : user.role?.name || "User";

  return (
    <div className="relative overflow-hidden">
      {/* Decorative gradient bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-primary via-primary/70 to-primary/40" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 sm:p-8 bg-card">
        {/* Avatar with upload overlay */}
        <AvatarUploader
          onUpload={handleImageUpload}
          onRemove={handleImageRemove}
          hasImage={!!user.profileImageUrl}
        >
          <div className="relative group cursor-pointer">
            <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-2 border-background shadow-md ring-2 ring-border/30 transition-all duration-150">
              <AvatarImage
                src={user.profileImageUrl || undefined}
                className="object-cover"
              />
              <AvatarFallback className="text-2xl sm:text-3xl font-bold bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <Camera className="text-white h-7 w-7" />
            </div>
          </div>
        </AvatarUploader>

        {/* User Info */}
        <div className="flex-1 min-w-0 space-y-2.5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {user.fullName}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                {user.email || user.enrollmentNumber || "No email"}
              </p>
            </div>

            <Badge
              variant="outline"
              className={`shrink-0 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider transition-colors ${getStatusStyles(displayStatus)}`}
            >
              {displayStatus}
            </Badge>
          </div>

          {/* Quick badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className="text-xs font-medium px-2.5 py-0.5"
            >
              {profileRoleString}
            </Badge>
            {user.branch && (
              <Badge
                variant="outline"
                className="text-xs bg-background px-2.5 py-0.5 font-medium"
              >
                <Building2 className="h-3 w-3 mr-1 opacity-60" />
                {typeof user.branch === "string"
                  ? user.branch
                  : (user.branch as any)?.name || "N/A"}
              </Badge>
            )}
            {user.enrollmentNumber &&
              user.enrollmentNumber !== "NOT_REQUIRED" && (
                <Badge
                  variant="outline"
                  className="text-xs bg-background font-mono px-2.5 py-0.5"
                >
                  <Fingerprint className="h-3 w-3 mr-1 opacity-60" />
                  {user.enrollmentNumber}
                </Badge>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
