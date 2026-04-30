import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { toastService } from "@/core/toast/toastService";
import { getAxiosErrorMessage } from "@/core/helper/errorMessage";
import {
  fetchProfessorSubjectHistory,
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
  type ProfileResponse,
  type UpdateProfileFormValues,
} from "@/modules/users/types/users.schemas";
import { useEnumViewModel } from "@/modules/enums/viewModel/useEnumViewModel";
import { fetchSystemSetting } from "@/modules/settings/model/settingsService";
import { EnumCategory } from "@/modules/enums/types/enum.schemas";

// V2 Imports
import { usePermissions } from "@/hooks/usePermissions";
import { ROLES } from "@/core/Constants/enums/role-enum-value";
import type {
  ProfessorSubjectHistoryMap,
  StaffProfileResponse,
} from "@/modules/users/types/staff.interface";

export const useUserDetailsViewModel = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userId = id!;

  //  V2 PBAC Setup
  const { hasPermission } = usePermissions();
  const canUpdateDetails = hasPermission("user:update");
  const canManageStatus = hasPermission("user:manage-status");
  const canManageRole = hasPermission("user:manage-role");

  // UI STATE
  const [isEditing, setIsEditing] = useState(false);
  const [expandedYearKey, setExpandedYearKey] = useState<string | undefined>(
    undefined,
  );
  const [activeYearKey, setActiveYearKey] = useState<string | undefined>(
    undefined,
  );

  // FETCH USER DETAILS
  const {
    data: userProfile,
    isLoading,
    isError,
  } = useQuery<ProfileResponse>({
    queryKey: ["user-details", userId],
    queryFn: () => fetchUserProfile(userId),
    enabled: !!userId,
  });

  //  V2 Fix: userProfile.role is now a string like "PROFESSOR".
  // We check this because Staff/History tables are specifically for teaching staff, regardless of permissions.
  const profileRoleString =
    typeof userProfile?.role === "string"
      ? userProfile.role
      : userProfile?.role?.name || "";

  const teachingRoles: string[] = [
    ROLES.PROFESSOR,
    ROLES.HOD,
    ROLES.SUPER_ADMIN,
  ];

  const isTeachingStaff = teachingRoles.includes(profileRoleString);

  // FETCH STAFF PROFILE
  const { data: staffProfile, isLoading: isStaffLoading } =
    useQuery<StaffProfileResponse>({
      queryKey: ["staff-profile", userId],
      queryFn: () => fetchStaffProfile(userId),
      enabled: !!userId && isTeachingStaff,
      retry: false,
    });

  // FETCH SUBJECT HISTORY
  const { data: historyMap, isLoading: isHistoryLoading } =
    useQuery<ProfessorSubjectHistoryMap>({
      queryKey: ["professor-history", userId],
      queryFn: () => fetchProfessorSubjectHistory(userId),
      enabled: !!userId && isTeachingStaff,
    });

  // FETCH SETTINGS FOR AUTO-EXPAND
  const { enums: academicYears } = useEnumViewModel(EnumCategory.ACADEMIC_YEAR);
  const { data: activeYearSetting } = useQuery({
    queryKey: ["system-setting", "CURRENT_ACADEMIC_YEAR_ID"],
    queryFn: () => fetchSystemSetting("CURRENT_ACADEMIC_YEAR_ID"),
  });

  // AUTO-EXPAND LOGIC
  useEffect(() => {
    if (activeYearSetting?.value && academicYears) {
      const activeYearEnum = academicYears.find(
        (y) => y.id.toString() === activeYearSetting.value,
      );

      if (activeYearEnum) {
        setActiveYearKey(activeYearEnum.key);
        if (historyMap && historyMap[activeYearEnum.key]) {
          setExpandedYearKey(activeYearEnum.key);
        }
      }
    }
  }, [activeYearSetting, academicYears, historyMap]);

  // SETUP FORM
  const form = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {},
  });

  // Sync fetched data into the form
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
        branchId: userProfile.branchId || undefined,
        genderId: userProfile.genderId || undefined,
        joinedAcademicYearId: userProfile.joinedAcademicYearId || undefined,
        expectedGraduateYearId: userProfile.expectedGraduateYearId || undefined,
      });
    }
  }, [userProfile, form]);

  // MUTATION: CHANGE STATUS
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

  // MUTATION: CHANGE ROLE
  const roleMutation = useMutation({
    mutationFn: (newRoleId: string) => updateUserRole(userId, newRoleId),
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

  // MUTATIONS: SENSITIVE FIELDS
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

    //  Export PBAC Flags to View
    canUpdateDetails,
    canManageStatus,
    canManageRole,

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
