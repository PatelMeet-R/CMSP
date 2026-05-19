import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { toastService } from "@/core/toast/toastService";

import {
  fetchAssignmentById,
  updateAssignment,
  uploadAssignmentFile,
} from "../model/assignmentService";
import { searchSubjects } from "../../subject-mapping/model/subjectMappingService";
import {
  assignmentFormSchema,
  type AssignmentFormValues,
  type UpdateAssignmentPayload,
} from "../types/assignment.schemas";

import { useAppSelector } from "@/store/hook";
import { usePermissions } from "@/hooks/usePermissions";
import { useBranchViewModel } from "@/modules/branch/viewModel/useBranchViewModel";
import { useEnumViewModel } from "@/modules/enums/viewModel/useEnumViewModel";
import { EnumCategory } from "@/modules/enums/types/enum.schemas";
import type { SubjectComboboxDTO } from "@/modules/subject-mapping/types/subject-mapping.types";

export function useAssignmentEditViewModel() {
  const { id } = useParams<{ id: string }>();
  const assignmentId = id!;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // --- 1. PBAC & AUTH ---
  const { user } = useAppSelector((state) => state.auth);
  const { hasPermission } = usePermissions();
  const canManageGlobal = hasPermission("assignment:manage-global");

  // --- 2. EXTERNAL DEPENDENCIES ---
  const { enums: semesters, isLoading: isSemLoading } = useEnumViewModel(
    EnumCategory.SEMESTER,
  );
  const { branches, isLoading: isBranchesLoading } = useBranchViewModel();

  // --- 3. UI STATE ---
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [removedExistingFile, setRemovedExistingFile] = useState(false);

  // --- 4. DATA FETCHING ---
  const { data: assignment, isLoading: isFetching } = useQuery({
    queryKey: ["assignment", assignmentId],
    queryFn: () => fetchAssignmentById(assignmentId),
    enabled: !!assignmentId,
  });

  // --- 5. FORM SETUP ---
  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: {
      title: "",
      description: "",
      subjectId: "",
      branchId: "",
      semesterId: "",
      academicYearId: "",
      attachmentId: null,
    },
  });

  // Populate form on load
  useEffect(() => {
    if (assignment) {
      form.reset({
        title: assignment.title ?? "",
        description: assignment.description ?? "",
        subjectId: assignment.subjectId ?? "",
        branchId:
          assignment.branchId ??
          (!canManageGlobal ? (user?.branchId ?? "") : ""),
        semesterId: assignment.semesterId ?? "",
        academicYearId: assignment.academicYearId ?? "",
        dueDate: assignment.dueDate
          ? new Date(assignment.dueDate)
          : (undefined as unknown as Date),
      });
    }
  }, [assignment, form, canManageGlobal, user]);

  const activeBranchId = canManageGlobal
    ? form.watch("branchId")
    : user?.branchId;

  // --- 6. HANDLERS ---
  const fetchSubjectsMemoized = useCallback(
    (term: string) =>
      searchSubjects(term, undefined, activeBranchId ?? undefined),
    [activeBranchId],
  );

  const handleSubjectSelect = (
    subjectId: string | null,
    rawData?: SubjectComboboxDTO | null,
  ) => {
    if (!subjectId) {
      form.setValue("subjectId", "", { shouldValidate: true });
      form.setValue("semesterId", "", { shouldValidate: true });
      return;
    }
    form.setValue("subjectId", subjectId, { shouldValidate: true });
    if (rawData?.semesterId) {
      form.setValue("semesterId", rawData.semesterId, { shouldValidate: true });
    }
  };

  // --- 7. MUTATIONS ---
  const updateMutation = useMutation({
    mutationFn: (payload: UpdateAssignmentPayload) =>
      updateAssignment(assignmentId, payload),
    onSuccess: () => {
      toastService.success("Assignment updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["assignment", assignmentId] });
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      navigate(-1);
    },
    onError: (error: any) => {
      toastService.error(
        error?.response?.data?.message || "Failed to update assignment.",
      );
    },
  });

  const onSubmit = async (values: AssignmentFormValues) => {
    try {
      const finalPayload: UpdateAssignmentPayload = {
        title: values.title,
        description: values.description,
        dueDate: values.dueDate.toISOString(),
        subjectId: values.subjectId,
        semesterId: values.semesterId,
        branchId: values.branchId,
      };

      // FILE LOGIC
      if (selectedFile) {
        setIsUploadingFile(true);
        try {
          const uploadedFileResponse = await uploadAssignmentFile(
            selectedFile,
            "assignments",
          );
          finalPayload.attachmentId = uploadedFileResponse.id;
        } catch (error) {
          toastService.error("File upload failed. Please try again.");
          setIsUploadingFile(false);
          return;
        }
        setIsUploadingFile(false);
      } else if (removedExistingFile) {
        finalPayload.attachmentId = null;
      }

      updateMutation.mutate(finalPayload);
    } catch (error) {
      console.error("Update Error", error);
    }
  };

  return {
    form,
    assignment,
    isFetching,
    navigate,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: updateMutation.isPending || isUploadingFile,

    // Auth & Dependencies
    canManageGlobal,
    branches,
    semesters,
    isPageLoading: isSemLoading || isBranchesLoading,

    // Handlers
    fetchSubjectsMemoized,
    handleSubjectSelect,

    fileState: {
      file: selectedFile,
      setFile: setSelectedFile,
      isUploading: isUploadingFile,
      existingUrl: assignment?.attachmentUrl,
      removedExistingFile,
      setRemovedExistingFile,
    },
  };
}
