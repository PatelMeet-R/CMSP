import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toastService } from "@/core/toast/toastService";
import { getAxiosErrorMessage } from "@/core/helper/errorMessage";
import {
  getProfile,
  updateProfile,
  updateProfileImage,
  uploadFile,
} from "../model/profileService";
import {
  updateProfileSchema,
  type UpdateProfileFormValues,
} from "@/modules/users/types/users.schemas";

export const useProfileViewModel = () => {
  const queryClient = useQueryClient();

  // 1. FETCH DATA
  const { data: profile, isLoading: isFetchingProfile } = useQuery({
    queryKey: ["profile", "me"],
    queryFn: getProfile,
  });

  // 2. SETUP FORM
  const form = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    values: profile
      ? {
          firstName: profile.firstName,
          lastName: profile.lastName,
          enrollmentNumber: profile.enrollmentNumber,
          branchId: profile.branchId || undefined,
          city: profile.address?.city || "",
          primaryMobileNumber: profile.primaryMobileNumber || "",
        }
      : undefined,
  });

  // 3. UPDATE TEXT DATA
  const updateMutation = useMutation({
    mutationFn: (data: UpdateProfileFormValues) => {
      const targetId = profile?.personalInfoId || profile?.id;
      if (!targetId) throw new Error("Profile ID missing");
      return updateProfile(targetId, data);
    },
    onSuccess: () => {
      toastService.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
    },
    onError: (error) => {
      toastService.error(
        getAxiosErrorMessage(error.message) || "Failed to update profile",
      );
    },
  });

  // 4. UPLOAD AVATAR
  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const targetId = profile?.personalInfoId || profile?.id;
      if (!targetId) throw new Error("Profile ID missing");

      const uploadRes = await uploadFile(file, "profiles");
     
      const imageId = uploadRes?.data?.id;
      if (!imageId) throw new Error("Did not receive Image ID from Cloudinary");
      const response = await updateProfileImage(targetId, imageId);

      return response.data;
    },
    onSuccess: () => {
      toastService.success("Profile picture updated!");
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
    },
    onError: () => toastService.error("Failed to update profile picture."),
  });

  // 5. REMOVE AVATAR
  const removeAvatarMutation = useMutation({
    mutationFn: async () => {
      const targetId = profile?.personalInfoId || profile?.id;
      if (!targetId) throw new Error("Profile ID missing");
      const response = await updateProfileImage(targetId, null);
      return response.data;
    },
    onSuccess: () => {
      toastService.success("Profile picture removed!");
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
    },
    onError: () => toastService.error("Failed to remove profile picture."),
  });

  return {
    form,
    profile,
    isFetchingProfile,
    isUpdating: updateMutation.isPending,
    onSubmit: (data: UpdateProfileFormValues) => updateMutation.mutate(data),

    //  Export the Avatar functions so the Header can use them!
    uploadAvatar: uploadAvatarMutation.mutateAsync,
    removeAvatar: removeAvatarMutation.mutateAsync,
    isUploadingAvatar:
      uploadAvatarMutation.isPending || removeAvatarMutation.isPending,
  };
};
