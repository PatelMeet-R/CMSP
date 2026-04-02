import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updateProfileSchema,
  type UpdateProfileFormValues,
} from "@/modules/profile/types/profile.schema";
import { toastService } from "@/core/toast/toastService";
import { getAxiosErrorMessage } from "@/core/helper/errorMessage";
import { getProfile, updateProfile } from "../model/profileService";

export const useProfileViewModel = () => {
  const queryClient = useQueryClient();

  //    FETCH DATA
  const { data: profile, isLoading: isFetchingProfile } = useQuery({
    queryKey: ["profile", "me"],
    queryFn: getProfile,
  });

  //    SETUP FORM
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

  //  UPDATE DATA
  const updateMutation = useMutation({
    mutationFn: (data: UpdateProfileFormValues) => {
      const targetId = profile?.personalInfoId || profile?.id;

      if (!targetId) throw new Error("Profile ID missing");

      return updateProfile(targetId, data);
    },
    onSuccess: () => {
      toastService.success("Profile updated successfully!");
      // re-fetch the fresh data
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
    },
    onError: (error: any) => {
      toastService.error(
        getAxiosErrorMessage(error) || "Failed to update profile",
      );
    },
  });

  //    SUBMIT
  const onSubmit = (data: UpdateProfileFormValues) => {
    updateMutation.mutate(data);
  };

  return {
    form,
    profile,
    isFetchingProfile,
    isUpdating: updateMutation.isPending,
    onSubmit,
  };
};
