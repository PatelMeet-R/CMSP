import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toastService } from "@/core/toast/toastService";
import { usePermissions } from "@/hooks/usePermissions";

import { enumService } from "../model/enumService";
import { useEnumViewModel } from "./useEnumViewModel"; // Reusing your GET hook
import {
  createEnumSchema,
  EnumCategory,
  type CreateEnumPayload,
  type UpdateEnumPayload,
  type EnumValueResponse,
} from "../types/enum.schemas";

export const useEnumManagementViewModel = () => {
  const queryClient = useQueryClient();

  // --- 1. PBAC ---
  const { hasPermission } = usePermissions();
  const canManageSettings = hasPermission("setting:manage");

  // --- 2. UI STATE ---
  // Default to the first category
  const [activeCategory, setActiveCategory] = useState<EnumCategory>(
    EnumCategory.SEMESTER,
  );
  const [enumToEdit, setEnumToEdit] = useState<EnumValueResponse | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // --- 3. DATA FETCHING ---
  const { enums, isLoading } = useEnumViewModel(activeCategory);

  // --- 4. FORM SETUP ---
  const form = useForm<CreateEnumPayload>({
    resolver: zodResolver(createEnumSchema),
    defaultValues: { key: "", value: "" },
  });

  // --- 5. MUTATIONS ---
  const createMutation = useMutation({
    mutationFn: (payload: CreateEnumPayload) =>
      enumService.createEnum(activeCategory, payload),
    onSuccess: () => {
      toastService.success("System value added successfully!");
      queryClient.invalidateQueries({ queryKey: ["enums", activeCategory] });
      setIsCreateModalOpen(false);
      form.reset();
    },
    onError: (err: any) =>
      toastService.error(err?.response?.data?.message || "Creation failed"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateEnumPayload }) =>
      enumService.updateEnum(id, payload),
    onSuccess: () => {
      toastService.success("System value updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["enums", activeCategory] });
      setEnumToEdit(null);
    },
    onError: (err: any) =>
      toastService.error(err?.response?.data?.message || "Update failed"),
  });

  // --- 6. HANDLERS ---
  const handleCreateSubmit = form.handleSubmit((data) =>
    createMutation.mutate(data),
  );

  const handleUpdateSubmit = (id: string, data: UpdateEnumPayload) => {
    updateMutation.mutate({ id, payload: data });
  };

  const openEditModal = (item: EnumValueResponse) => {
    setEnumToEdit(item);
    form.reset({ key: item.key, value: item.value });
  };

  const closeModals = () => {
    setIsCreateModalOpen(false);
    setEnumToEdit(null);
    form.reset({ key: "", value: "" });
  };

  return {
    // Data & Status
    activeCategory,
    setActiveCategory,
    enums,
    isLoading,
    canManageSettings,

    // Modal States
    isCreateModalOpen,
    setIsCreateModalOpen,
    enumToEdit,

    // Actions
    form,
    handleCreateSubmit,
    handleUpdateSubmit,
    openEditModal,
    closeModals,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
  };
};
