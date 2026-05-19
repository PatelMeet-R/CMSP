import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toastService } from "@/core/toast/toastService";
import { getAxiosErrorMessage } from "@/core/helper/errorMessage";

import {
  staffRegisterSchema,
  type StaffRegisterFormValues,
} from "../types/users.schemas";

import { useAppSelector } from "@/store/hook";
import { ROUTENAME } from "@/core/Constants/RouteName";
import { registerStaff } from "../model/usersService";
import type { AxiosError } from "axios";
// V2 Imports
import { usePermissions } from "@/hooks/usePermissions";
import { useRoleViewModel } from "@/modules/roles/viewModel/useRoleViewModel";

export const useCreateStaffViewModel = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAppSelector((state) => state.auth);

  //  V2 PBAC Integration
  const { isSuperAdmin, hasPermission } = usePermissions();
  const canCreateStaff = hasPermission("user:create");
  const { roles, isRolesLoading } = useRoleViewModel();
  // console.log("Roles for staff creation:", roles);

  const currentUserBranchId = user?.branchId;
  const defaultBranchId = isSuperAdmin ? null : currentUserBranchId || null;

  const form = useForm<StaffRegisterFormValues>({
    resolver: zodResolver(staffRegisterSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      roleId: "", // V2: string UUID instead of 0
      branchId: defaultBranchId || "",
      designation: "",
      officeLocation: "",
      joiningDate: new Date().toISOString().split("T")[0],
    },
  });

  const mutation = useMutation({
    mutationFn: registerStaff,
    onSuccess: () => {
      toastService.success(
        "Staff registered successfully! Credentials have been emailed.",
      );
      queryClient.invalidateQueries({ queryKey: ["users"] });
      navigate(ROUTENAME.ALL_USERS);
    },
    onError: (error: AxiosError<{ message: string | string[] }>) => {
      const backendMessage = error.response?.data?.message;
      const fallbackMessage =
        getAxiosErrorMessage(error.message) || "Failed to register staff";

      const finalMessage = Array.isArray(backendMessage)
        ? backendMessage[0]
        : backendMessage || fallbackMessage;

      toastService.error(finalMessage);
    },
  });

  const onSubmit = (data: StaffRegisterFormValues) => {
    mutation.mutate(data);
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: mutation.isPending,
    isSuperAdmin,
    canCreateStaff, // Export for View to use
    isRolesLoading,
    roles,
    navigate,
  };
};
