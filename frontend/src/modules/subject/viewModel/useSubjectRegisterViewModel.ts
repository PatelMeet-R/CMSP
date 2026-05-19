import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toastService } from "@/core/toast/toastService";
import { createSubjectDetails } from "@/modules/subject/model/subjectService";
import { useAppSelector } from "@/store/hook";
import { usePermissions } from "@/hooks/usePermissions";
import { useBranchViewModel } from "@/modules/branch/viewModel/useBranchViewModel";
import { useEnumViewModel } from "@/modules/enums/viewModel/useEnumViewModel";
import { EnumCategory } from "@/modules/enums/types/enum.schemas";
import {
  createSubjectSchema,
  type BranchResponse,
  type CreateSubjectPayload,
  type SemesterResponse,
} from "@/modules/subject/types/subject.schemas";

export const useSubjectRegisterViewModel = () => {
  const queryClient = useQueryClient();

  // --- 1. PBAC & AUTH ---
  const { user } = useAppSelector((state) => state.auth);
  const { hasPermission } = usePermissions();
  const canManageGlobal = hasPermission("subject:manage-global");

  // --- 2. EXTERNAL DEPENDENCIES ---
  const { branches, isLoading: isBranchesLoading } = useBranchViewModel();
  const { enums: semesters, isLoading: isSemestersLoading } = useEnumViewModel(
    EnumCategory.SEMESTER,
  );

  const branchOptions =
    branches?.map((b: BranchResponse) => ({ id: b.id, label: b.name })) || [];
  const semesterOptions =
    semesters?.map((s: SemesterResponse) => ({ id: s.id, label: s.value })) ||
    [];

  // --- 3. FORM SETUP ---
  const form = useForm<CreateSubjectPayload>({
    resolver: zodResolver(createSubjectSchema),
    defaultValues: {
      name: "",
      code: "",
      branchId: !canManageGlobal ? (user?.branchId ?? "") : "",
      semesterId: "",
    },
  });

  // --- 4. API MUTATION ---
  const createMutation = useMutation({
    mutationFn: (newSubject: CreateSubjectPayload) =>
      createSubjectDetails(newSubject),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      toastService.success("Subject created successfully!");
    },
    onError: (err) => toastService.error(err.message),
  });

  return {
    form,
    isCreating: createMutation.isPending,
    canManageGlobal,
    branchOptions,
    isBranchesLoading,
    semesterOptions,
    isSemestersLoading,
    onSubmit: form.handleSubmit((data) => createMutation.mutateAsync(data)),
  };
};
