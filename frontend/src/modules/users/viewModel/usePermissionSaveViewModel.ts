import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toastService } from "@/core/toast/toastService";
import { getAxiosErrorMessage } from "@/core/helper/errorMessage";
import { savePermissionOverrides } from "@/modules/users/model/usersService";
import {
  formSchema,
  type PermissionSaveFormValues,
  type PermissionSaveProps,
} from "@/modules/users/types/permission.interface";

export function usePermissionSaveViewModel({
  personalInfoId,
  localOverrides,
  onClose,
  onSuccessCallback,
}: PermissionSaveProps) {
  const queryClient = useQueryClient();

  const form = useForm<PermissionSaveFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { reason: "" },
  });

  const saveMutation = useMutation({
    mutationFn: (payload: { overrides: any[]; reason: string }) =>
      savePermissionOverrides(personalInfoId, payload),
    onSuccess: () => {
      toastService.success("Permissions updated successfully.");
      form.reset();
      // Instantly refresh the matrix data behind the scenes
      queryClient.invalidateQueries({
        queryKey: ["permission-matrix", personalInfoId],
      });
      onSuccessCallback();
    },
    onError: (error) => {
      toastService.error(getAxiosErrorMessage(error));
    },
  });

  const onSubmit = (data: PermissionSaveFormValues) => {
    // Transform Map into the exact array the backend expects
    const overridesArray = Array.from(localOverrides.values()).map(
      (override) => ({
        permissionSlug: override.slug,
        state: override.state,
      }),
    );

    saveMutation.mutate({
      overrides: overridesArray,
      reason: data.reason,
    });
  };

  const handleOpenChange = (open: boolean) => {
    if (saveMutation.isPending) return;
    if (!open) {
      form.reset();
      onClose();
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isPending: saveMutation.isPending,
    handleOpenChange,
    dirtyCount: localOverrides.size,
  };
}
