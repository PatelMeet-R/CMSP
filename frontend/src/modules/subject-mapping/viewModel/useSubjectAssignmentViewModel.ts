import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toastService } from "@/core/toast/toastService";
import { getAxiosErrorMessage } from "@/core/helper/errorMessage";
import {
  assignSubjectToProfessor,
  fetchActiveAssignments,
  unassignSubject,
} from "../model/subjectMappingService";
import { useSystemSettingsViewModel } from "@/modules/settings/viewModel/useSystemSettingsViewModel";
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";

interface AssignFormValues {
  professorId: number;
  subjectId: number;
  semesterId: number;
  academicYearId: number;
}

export const useSubjectAssignmentViewModel = () => {
  const queryClient = useQueryClient();

  // Get the globally active academic year so we can auto-fill the form!
  const { selectedYearId: activeAcademicYearId } = useSystemSettingsViewModel();

  const form = useForm<AssignFormValues>({
    defaultValues: {
      professorId: undefined,
      subjectId: undefined,
      semesterId: undefined,
      academicYearId: activeAcademicYearId || undefined, // Auto-selects the current year!
    },
  });
  useEffect(() => {
    if (activeAcademicYearId) {
      form.setValue("academicYearId", activeAcademicYearId);
    }
  }, [activeAcademicYearId, form]);

  // 🚀 WATCHERS: We watch semesterId so we can pass it to the Subject Combobox to filter its API call
  const selectedSemesterId = form.watch("semesterId");

  // This is called when the AsyncCombobox selects a subject.
  const handleSubjectSelect = (subjectId: number, rawSubjectData?: any) => {
    // 1. Set the Subject ID
    form.setValue("subjectId", subjectId, { shouldValidate: true });

    // 2. Auto-Fill the Semester!
    // If the selected subject has a semester attached to it, force the semester dropdown to match it instantly.
    if (rawSubjectData?.semester?.id) {
      form.setValue("semesterId", rawSubjectData.semester.id, {
        shouldValidate: true,
      });
    }
  };

  //  MUTATION: Submit the assignment
  const assignMutation = useMutation({
    mutationFn: (data: AssignFormValues) => assignSubjectToProfessor(data),
    onSuccess: () => {
      toastService.success("Subject assigned successfully!");
      // Reset the form but keep the academic year and professor so they can quickly assign another!
      form.reset({
        professorId: undefined,
        subjectId: undefined,
        semesterId: undefined,
        academicYearId: activeAcademicYearId || undefined,
      });

      // Refresh the data table
      queryClient.invalidateQueries({ queryKey: ["active-assignments"] });
    },
    onError: (error: any) => {
      toastService.error(
        getAxiosErrorMessage(error.message) || "Failed to assign subject",
      );
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    assignMutation.mutate(data);
  });

  // ==================================
  const [tableSearch, setTableSearch] = useState("");
  const [tableBranchId, setTableBranchId] = useState<number | undefined>(
    undefined,
  );
  const [tableAcademicYearId, setTableAcademicYearId] = useState<
    number | undefined
  >(activeAcademicYearId);

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
  // ==================================

  return {
    form,
    onSubmit,
    isAssigning: assignMutation.isPending,
    selectedSemesterId,
    handleSubjectSelect,

    // ================================
    table: {
      search: tableSearch,
      setSearch: setTableSearch,
      branchId: tableBranchId,
      setBranchId: setTableBranchId,
      //
      academicYearId: tableAcademicYearId,
      setAcademicYearId: setTableAcademicYearId,
      //
      data: assignmentsData,
      isLoading: isTableLoading,
      onUnassign: (id: number) => unassignMutation.mutate(id),
      isUnassigning: unassignMutation.isPending,
    },
  };
};
