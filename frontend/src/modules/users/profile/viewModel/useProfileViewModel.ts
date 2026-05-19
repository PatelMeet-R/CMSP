import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { toastService } from "@/core/toast/toastService";
import {
  getProfile,
  updateProfileImage,
  uploadFile,
} from "../model/profileService";
import { updateUserDetails } from "@/modules/users/model/usersService";
import {
  updateProfileSchema,
  type UpdateProfileFormValues,
} from "@/modules/users/types/users.schemas";
import { usePermissions } from "@/hooks/usePermissions";
import { useAppSelector } from "@/store/hook"; // 🚨 Imported to check email status

export const useProfileViewModel = () => {
  const queryClient = useQueryClient();

  // --- 1. PBAC & AUTH LOGIC ---
  const { hasPermission } = usePermissions();
  const { user } = useAppSelector((state) => state.auth); // 🚨 Added for email verification status

  const canEditRestricted =
    hasPermission("user:manage-global") ||
    hasPermission("user:update-restricted");

  // --- 2. UI STATE ---
  const [isEditing, setIsEditing] = useState(false);
  const [isVerificationAlertOpen, setIsVerificationAlertOpen] = useState(true); // 🚨 Added for Alert Component

  // --- 3. FETCH DATA ---
  const { data: profile, isLoading: isFetchingProfile } = useQuery({
    queryKey: ["profile", "me"],
    queryFn: getProfile,
  });

  // Compute email verification safely
  const isEmailVerified = user?.isEmailVerified ?? true;

  // --- 4. FORM SETUP ---
  const form = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      enrollmentNumber: "",
      branchId: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      primaryMobileNumber: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        enrollmentNumber: profile.enrollmentNumber || "",
        branchId: profile.branchId || "",
        city: profile.address?.city || "",
        state: profile.address?.state || "",
        country: profile.address?.country || "",
        postalCode: profile.address?.postalCode || "",
        primaryMobileNumber: profile.primaryMobileNumber || "",
      });
    }
  }, [profile, form, isEditing]);

  // --- 5. MUTATIONS ---
  const updateMutation = useMutation({
    mutationFn: async (data: UpdateProfileFormValues) => {
      const targetId = profile?.personalInfoId || profile?.id;
      if (!targetId) throw new Error("Profile ID missing");
      return updateUserDetails(targetId, data);
    },
    onSuccess: () => {
      toastService.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
      setIsEditing(false);
    },
    onError: (err: any) => {
      toastService.error(
        err?.response?.data?.message || "Failed to update profile.",
      );
    },
  });

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

  // --- 6. HANDLERS ---
  const handleCancelEdit = () => {
    form.reset();
    setIsEditing(false);
  };

  return {
    form,
    profile,
    isFetchingProfile,

    // UI State
    isEditing,
    setIsEditing,
    canEditRestricted,
    isEmailVerified,
    isVerificationAlertOpen,
    closeVerificationAlert: () => setIsVerificationAlertOpen(false),

    // Handlers & Mutations
    isUpdating: updateMutation.isPending,
    onSubmit: form.handleSubmit((data) => updateMutation.mutate(data)),
    cancelEdit: handleCancelEdit,
    uploadAvatar: uploadAvatarMutation.mutateAsync,
    removeAvatar: removeAvatarMutation.mutateAsync,
  };
};
