import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { toastService } from "@/core/toast/toastService";
import { getAxiosErrorMessage } from "@/core/helper/errorMessage";
import {
  fetchUserProfile,
  updateAccountStatus,
  updateUserDetails,
  updateUserRole,
} from "../model/usersService";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  updateProfileSchema,
  type UpdateProfileFormValues,
} from "@/modules/users/types/users.schemas";

export const useUserDetailsViewModel = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userId = Number(id);

  //    UI STATE
  const [isEditing, setIsEditing] = useState(false);

  //    FETCH USER DETAILS
  const {
    data: userProfile,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["user-details", userId],
    queryFn: () => fetchUserProfile(userId),
    enabled: !!userId,
  });

  //    SETUP FORM
  const form = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {},
  });

  //    Sync fetched data into the form
  useEffect(() => {
    if (userProfile) {
      form.reset({
        firstName: userProfile.firstName || "",
        lastName: userProfile.lastName || "",
        enrollmentNumber:
          userProfile.enrollmentNumber === "NOT_REQUIRED"
            ? ""
            : userProfile.enrollmentNumber,
        primaryMobileNumber: userProfile.primaryMobileNumber || "",
        secondaryMobileNumber: userProfile.secondaryMobileNumber || "",
        city: userProfile.address?.city || "",
        state: userProfile.address?.state || "",
        country: userProfile.address?.country || "",
        postalCode: userProfile.address?.postalCode || "",
        // Relational IDs
        branchId: userProfile.branchId,
        genderId: userProfile.genderId,
        joinedAcademicYearId: userProfile.joinedAcademicYearId,
        expectedGraduateYearId: userProfile.expectedGraduateYearId,
      });
    }
  }, [userProfile, form]);

  //    MUTATION: CHANGE STATUS
  const statusMutation = useMutation({
    mutationFn: (statusKey: string) => updateAccountStatus(userId, statusKey),
    onSuccess: () => {
      toastService.success("User status updated!");
      queryClient.invalidateQueries({ queryKey: ["user-details", userId] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      toastService.error(
        getAxiosErrorMessage(error.message) || "Failed to update status",
      );
    },
  });

  //    MUTATION: CHANGE ROLE
  const roleMutation = useMutation({
    mutationFn: (newRoleId: number) => updateUserRole(userId, newRoleId),
    onSuccess: () => {
      toastService.success("User role updated!");
      queryClient.invalidateQueries({ queryKey: ["user-details", userId] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      toastService.error(
        getAxiosErrorMessage(error.message) || "Failed to update role",
      );
    },
  });

  //    MUTATIONS:  SENSITIVE FIELDS
  const updateDetailsMutation = useMutation({
    mutationFn: (data: UpdateProfileFormValues) =>
      updateUserDetails(userId, data),
    onSuccess: () => {
      toastService.success("User details updated successfully!");
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["user-details", userId] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      toastService.error(
        getAxiosErrorMessage(error.message) || "Failed to update user",
      );
    },
  });

  return {
    userProfile,
    isLoading,
    isError,
    navigate,

    form,
    isEditing,
    setIsEditing,
    isDirty: form.formState.isDirty,
    isUpdatingDetails: updateDetailsMutation.isPending,
    onSubmitDetails: form.handleSubmit((data) =>
      updateDetailsMutation.mutate(data),
    ),

    isUpdating: statusMutation.isPending || roleMutation.isPending,
    updateStatus: statusMutation.mutate,
    updateRole: roleMutation.mutate,
  };
};
