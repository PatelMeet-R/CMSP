import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toastService } from "@/core/toast/toastService";
import { usePermissions } from "@/hooks/usePermissions";
import { updateBranch } from "../model/branchService";
import {
  updateBranchSchema,
  type UpdateBranchPayload,
  type Branch,
} from "../types/branch.schemas";

export const useBranchEditViewModel = (branchToEdit?: Branch | null) => {
  const queryClient = useQueryClient();

  // PBAC Authorization
  const { hasPermission } = usePermissions();
  const canUpdate = hasPermission("branch:update");

  const form = useForm<UpdateBranchPayload>({
    resolver: zodResolver(updateBranchSchema),
    defaultValues: {
      name: "",
      code: "",
    },
  });

  // Populate form
  useEffect(() => {
    if (branchToEdit) {
      form.reset({
        name: branchToEdit.name,
        code: branchToEdit.code,
      });
    }
  }, [branchToEdit, form]);

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateBranchPayload) => {
      if (!branchToEdit?.id) throw new Error("Branch ID missing");
      return updateBranch(branchToEdit.id, payload);
    },
    onSuccess: () => {
      toastService.success("Branch updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
    onError: (error: any) => {
      toastService.error(
        error?.response?.data?.message || "Failed to update branch.",
      );
    },
  });

  return {
    form,
    canUpdate,
    isUpdating: updateMutation.isPending,
    onSubmit: form.handleSubmit((data) => updateMutation.mutateAsync(data)),
  };
};
