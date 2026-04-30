import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Camera } from "lucide-react";
import { useProfileViewModel } from "../viewModel/useProfileViewModel";
import { AvatarUploader } from "@/modules/users/profile/view/avatar-uploader";
import type { ProfileResponse } from "@/modules/users/types/users.schemas";

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

  return (
    <div className="flex items-center gap-6 p-6 border-b bg-card rounded-t-xl">
      <AvatarUploader
        onUpload={handleImageUpload}
        onRemove={handleImageRemove}
        hasImage={!!user.profileImageUrl}
      >
        <div className="relative group cursor-pointer">
          <Avatar className="h-28 w-28 ring-4 ring-background shadow-lg transition-all">
            <AvatarImage
              src={user.profileImageUrl || undefined}
              className="object-cover"
            />
            <AvatarFallback className="bg-primary/10 text-primary text-3xl font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="text-white h-8 w-8" />
          </div>
        </div>
      </AvatarUploader>

      <div className="flex flex-col">
        <h1 className="text-2xl font-bold">{user.fullName}</h1>
        <p className="text-muted-foreground">
          {user.enrollmentNumber || user.email}
        </p>
        <span className="mt-2 inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 w-fit">
          {user.branch || "No Branch"} • {displayStatus}
        </span>
      </div>
    </div>
  );
}
