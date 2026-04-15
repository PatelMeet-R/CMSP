import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { toastService } from "@/core/toast/toastService";
import { getAxiosErrorMessage } from "@/core/helper/errorMessage";
import {
  fetchProfessorHistory,
  fetchStaffProfile,
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
import { useEnumViewModel } from "@/modules/enums/viewModel/useEnumViewModel";
import { fetchSystemSetting } from "@/modules/settings/model/settingsService";
import { EnumCategory } from "@/modules/enums/types/enum.schemas";

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

  //    NEW: ACCORDION & PROFILE STATE
  const [expandedYearKey, setExpandedYearKey] = useState<string | undefined>(
    undefined,
  );

  //    NEW: FETCH STAFF PROFILE
  const { data: staffProfile, isLoading: isStaffLoading } = useQuery({
    queryKey: ["staff-profile", userId],
    queryFn: () => fetchStaffProfile(userId),
    enabled:
      !!userId &&
      (userProfile?.role === "PROFESSOR" ||
        userProfile?.role === "HOD" ||
        userProfile?.role?.key === "PROFESSOR" ||
        userProfile?.role?.key === "HOD"),
    retry: false, // Don't retry if they are a student without a profile
  });

  //    NEW: FETCH SUBJECT HISTORY
  const { data: historyMap, isLoading: isHistoryLoading } = useQuery({
    queryKey: ["professor-history", userId],
    queryFn: () => fetchProfessorHistory(userId),
    enabled:
      !!userId &&
      (userProfile?.role === "PROFESSOR" ||
        userProfile?.role === "HOD" ||
        userProfile?.role?.key === "PROFESSOR" ||
        userProfile?.role?.key === "HOD"),
  });

  //    NEW: FETCH SETTINGS FOR AUTO-EXPAND
  const { enums: academicYears } = useEnumViewModel(EnumCategory.ACADEMIC_YEAR);
  const { data: activeYearSetting } = useQuery({
    queryKey: ["system-setting", "CURRENT_ACADEMIC_YEAR_ID"],
    queryFn: () => fetchSystemSetting("CURRENT_ACADEMIC_YEAR_ID"),
  });

  //    NEW: AUTO-EXPAND LOGIC
  const [activeYearKey, setActiveYearKey] = useState<string | undefined>(
    undefined,
  );

  //    NEW: AUTO-EXPAND LOGIC
  useEffect(() => {
    if (activeYearSetting?.value && academicYears) {
      const activeYearEnum = academicYears.find(
        (y) => y.id.toString() === activeYearSetting.value,
      );

      if (activeYearEnum) {
        setActiveYearKey(activeYearEnum.key); // Save this for student filtering!

        // Only expand if the map exists and has data for this year
        if (historyMap && historyMap[activeYearEnum.key]) {
          setExpandedYearKey(activeYearEnum.key);
        }
      }
    }
  }, [activeYearSetting, academicYears, historyMap]);

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
    staffProfile,
    historyMap,
    expandedYearKey,
    setExpandedYearKey,
    activeYearKey,
    isLoading: isLoading || isStaffLoading || isHistoryLoading,
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
