import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toastService } from "@/core/toast/toastService";
import { getAxiosErrorMessage } from "@/core/helper/errorMessage";
import { useDebounce } from "@/hooks/use-debounce";

import { usePermissions } from "@/hooks/usePermissions";
import { useSystemSettingsViewModel } from "@/modules/settings/viewModel/useSystemSettingsViewModel";
import { useBranchViewModel } from "@/modules/branch/viewModel/useBranchViewModel";
import { useEnumViewModel } from "@/modules/enums/viewModel/useEnumViewModel";
import { EnumCategory } from "@/modules/enums/types/enum.schemas";

import {
  assignSubjectToProfessor,
  fetchActiveAssignments,
  unassignSubject,
  searchStaff,
  searchSubjects,
} from "../model/subjectMappingService";
import type { SubjectComboboxDTO } from "@/modules/subject-mapping/types/subject-mapping.types";

interface AssignFormValues {
  professorId: string;
  subjectId: string;
  semesterId: string;
  academicYearId: string;
}

export const useSubjectAssignmentViewModel = () => {
  const queryClient = useQueryClient();

  // --- 1. PBAC & AUTH ---
  const { hasPermission } = usePermissions();
  const canManageGlobal = hasPermission("assignment:manage-global");

  // --- 2. GLOBAL SETTINGS & DEPENDENCIES ---
  const { selectedYearId: activeAcademicYearId } = useSystemSettingsViewModel();
  const { enums: semesters, isLoading: isSemLoading } = useEnumViewModel(
    EnumCategory.SEMESTER,
  );
  const { enums: academicYears, isLoading: isYearLoading } = useEnumViewModel(
    EnumCategory.ACADEMIC_YEAR,
  );
  const { branches, isLoading: isBranchesLoading } = useBranchViewModel();

  // --- 3. UI STATE ---
  const [selectedBranchId, setSelectedBranchId] = useState<string | undefined>(
    undefined,
  );

  // --- 4. FORM SETUP ---
  const form = useForm<AssignFormValues>({
    defaultValues: {
      professorId: undefined,
      subjectId: undefined,
      semesterId: undefined,
      academicYearId: activeAcademicYearId || undefined,
    },
  });

  useEffect(() => {
    if (activeAcademicYearId) {
      form.setValue("academicYearId", activeAcademicYearId);
    }
  }, [activeAcademicYearId, form]);

  const currentYearId = form.watch("academicYearId");
  const activeYearDisplay =
    academicYears?.find((y) => y.id === currentYearId)?.value || "Loading...";
  const activeSemesterId = form.watch("semesterId");

  // --- 5. ASYNC SEARCH HANDLERS ---
  const fetchStaffMemoized = useCallback(
    (term: string) => searchStaff(term, selectedBranchId),
    [selectedBranchId],
  );

  const fetchSubjectsMemoized = useCallback(
    (term: string) => searchSubjects(term, activeSemesterId, selectedBranchId),
    [activeSemesterId, selectedBranchId],
  );

  const handleSubjectSelect = (
    subjectId: string | null,
    rawData?: SubjectComboboxDTO | null,
  ) => {
    if (!subjectId) {
      form.setValue("subjectId", undefined as unknown as string, {
        shouldValidate: true,
      });
      form.setValue("semesterId", undefined as unknown as string, {
        shouldValidate: true,
      });
      return;
    }

    form.setValue("subjectId", subjectId, { shouldValidate: true });

    if (rawData?.semester && semesters) {
      const semString = rawData.semester;
      const matchedSem = semesters.find(
        (s) => s.key === semString || s.value === semString,
      );
      if (matchedSem) {
        form.setValue("semesterId", matchedSem.id, { shouldValidate: true });
      }
    }
  };

  // --- 6. ASSIGN MUTATION ---
  const assignMutation = useMutation({
    mutationFn: (data: AssignFormValues) => assignSubjectToProfessor(data),
    onSuccess: () => {
      toastService.success("Subject assigned successfully!");
      form.reset({
        professorId: undefined,
        subjectId: undefined,
        semesterId: undefined,
        academicYearId: activeAcademicYearId || undefined,
      });
      queryClient.invalidateQueries({ queryKey: ["active-assignments"] });
    },
    onError: (error: any) => {
      toastService.error(
        getAxiosErrorMessage(error.message) || "Failed to assign subject",
      );
    },
  });

  // --- 7. TABLE STATE & QUERY ---
  const [tableSearch, setTableSearch] = useState("");
  const [tableBranchId, setTableBranchId] = useState<string | undefined>(
    undefined,
  );
  const [tableAcademicYearId, setTableAcademicYearId] = useState<
    string | undefined
  >(activeAcademicYearId?.toString());
  const debouncedTableSearch = useDebounce(tableSearch, 1500);

  const { data: assignmentsData, isLoading: isTableLoading } = useQuery({
    queryKey: [
      "active-assignments",
      debouncedTableSearch,
      tableBranchId,
      tableAcademicYearId,
    ],
    queryFn: () =>
      fetchActiveAssignments({
        page: 1,
        limit: 50,
        search: debouncedTableSearch,
        branchId: tableBranchId,
        academicYearId: tableAcademicYearId,
      }),
  });

  const unassignMutation = useMutation({
    mutationFn: unassignSubject,
    onSuccess: () => {
      toastService.success("Subject unassigned successfully.");
      queryClient.invalidateQueries({ queryKey: ["active-assignments"] });
    },
    onError: () => toastService.error("Failed to unassign subject."),
  });

  // --- 8. EXPOSE INTERFACE ---
  return {
    // Form & Actions
    form,
    onSubmit: form.handleSubmit((data) => assignMutation.mutate(data)),
    isAssigning: assignMutation.isPending,

    // Dependencies & Status
    canManageGlobal,
    branches,
    semesters,
    academicYears,
    isPageLoading:
      isSemLoading || isYearLoading || (canManageGlobal && isBranchesLoading),

    // Custom UI State
    selectedBranchId,
    setSelectedBranchId,
    activeYearDisplay,

    // Async Handlers
    fetchStaffMemoized,
    fetchSubjectsMemoized,
    handleSubjectSelect,

    // Table Context
    table: {
      search: tableSearch,
      setSearch: setTableSearch,
      branchId: tableBranchId,
      setBranchId: setTableBranchId,
      academicYearId: tableAcademicYearId,
      setAcademicYearId: setTableAcademicYearId,
      data: assignmentsData,
      isLoading: isTableLoading,
      onUnassign: (id: string) => unassignMutation.mutate(id),
      isUnassigning: unassignMutation.isPending,
    },
  };
};
