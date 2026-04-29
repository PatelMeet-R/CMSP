import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toastService } from "@/core/toast/toastService";
import { usePermissions } from "@/hooks/usePermissions";
import { createBranch } from "../model/branchService";
import {
  createBranchSchema,
  type CreateBranchPayload,
} from "../types/branch.schemas";

export const useBranchRegisterViewModel = () => {
  const queryClient = useQueryClient();

  // PBAC Authorization
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission("branch:create");

  const form = useForm<CreateBranchPayload>({
    resolver: zodResolver(createBranchSchema),
    defaultValues: {
      name: "",
      code: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: createBranch,
    onSuccess: () => {
      toastService.success("Branch registered successfully!");
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      form.reset();
    },
    onError: (error: any) => {
      toastService.error(
        error?.response?.data?.message || "Failed to create branch.",
      );
    },
  });

  return {
    form,
    canCreate,
    isCreating: createMutation.isPending,
    onSubmit: form.handleSubmit((data) => createMutation.mutateAsync(data)),
  };
};
