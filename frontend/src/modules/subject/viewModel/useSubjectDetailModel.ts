import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { toastService } from "@/core/toast/toastService";
import { useAppSelector } from "@/store/hook";
import { usePermissions } from "@/hooks/usePermissions";
import { useBranchViewModel } from "@/modules/branch/viewModel/useBranchViewModel";
import { useEnumViewModel } from "@/modules/enums/viewModel/useEnumViewModel";
import { EnumCategory } from "@/modules/enums/types/enum.schemas";

import {
  getSubjectDetails,
  updateSubjectDetails,
} from "@/modules/subject/model/subjectService";
import {
  updateSubjectSchema,
  type BranchResponse,
  type SemesterResponse,
  type SubjectDetails,
  type UpdateSubjectPayload,
} from "@/modules/subject/types/subject.schemas";

export const useSubjectDetailViewModel = (id: string | undefined) => {
  const queryClient = useQueryClient();

  // --- 1. UI STATE ---
  const [isEditing, setIsEditing] = useState(false);

  // --- 2. PBAC & AUTH ---
  const { user } = useAppSelector((state) => state.auth);
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission("subject:update");
  const canManageGlobal = hasPermission("subject:manage-global");

  // --- 3. FETCH CORE DATA ---
  const { data: subject, isLoading: isFetching } = useQuery<SubjectDetails>({
    queryKey: ["subject", id],
    queryFn: () => getSubjectDetails(id!),
    enabled: !!id,
  });

  // --- 4. EXTERNAL DEPENDENCIES (Dropdowns) ---
  const { branches, isLoading: isBranchesLoading } = useBranchViewModel();
  const { enums: semesters, isLoading: isSemestersLoading } = useEnumViewModel(
    EnumCategory.SEMESTER,
  );

  const branchOptions =
    branches?.map((b: BranchResponse) => ({ id: b.id, label: b.name })) || [];
  const semesterOptions =
    semesters?.map((s: SemesterResponse) => ({ id: s.id, label: s.value })) ||
    [];

  // --- 5. FORM SETUP ---
  const form = useForm<UpdateSubjectPayload>({
    resolver: zodResolver(updateSubjectSchema),
    defaultValues: {
      name: "",
      code: "",
      branchId: !canManageGlobal ? (user?.branchId ?? "") : "",
      semesterId: "",
    },
  });

  // Populate form when data arrives
  useEffect(() => {
    if (subject) {
      form.reset({
        name: subject.name ?? "",
        code: subject.code ?? "",
        branchId:
          subject.branch?.id ??
          (!canManageGlobal ? (user?.branchId ?? "") : ""),
        semesterId: subject.semester?.id ?? "",
      });
    }
  }, [subject, form, isEditing, user, canManageGlobal]);

  // --- 6. API MUTATION ---
  const updateMutation = useMutation({
    mutationFn: (updatedData: UpdateSubjectPayload) =>
      updateSubjectDetails(id!, updatedData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subject", id] });
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      toastService.success("Subject updated successfully!");
      setIsEditing(false); // Switch back to view mode on success
    },
    onError: (err) => {
      toastService.error(err.message || "Failed to update subject");
    },
  });

  // --- 7. HANDLERS ---
  const handleCancel = () => {
    form.reset();
    setIsEditing(false);
  };

  const onSubmit = form.handleSubmit((data) =>
    updateMutation.mutateAsync(data),
  );

  // --- 8. EXPOSE CLEAN INTERFACE TO VIEW ---
  return {
    // Core Data
    subject,
    isFetching,

    // UI State
    isEditing,
    setIsEditing,

    // Form & Handlers
    form,
    isUpdating: updateMutation.isPending,
    onSubmit,
    handleCancel,

    // Security & Lookups
    canEdit,
    canManageGlobal,
    branchOptions,
    isBranchesLoading,
    semesterOptions,
    isSemestersLoading,
  };
};
