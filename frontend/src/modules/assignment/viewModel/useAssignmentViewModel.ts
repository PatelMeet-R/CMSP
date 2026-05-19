import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toastService } from "@/core/toast/toastService";
import { useSearchParams, useNavigate } from "react-router-dom";

import {
  uploadAssignmentFile,
  createAssignment,
  deleteUploadedFile,
  fetchMyActiveSubjects,
  fetchAssignmentById,
} from "../model/assignmentService";
import { searchSubjects } from "../../subject-mapping/model/subjectMappingService";
import {
  assignmentFormSchema,
  type AssignmentFormValues,
  type AssignmentPayload,
} from "@/modules/assignment/types/assignment.schemas";

import { useAppSelector } from "@/store/hook";
import { usePermissions } from "@/hooks/usePermissions";
import { useSystemSettingsViewModel } from "@/modules/settings/viewModel/useSystemSettingsViewModel";
import { useBranchViewModel } from "@/modules/branch/viewModel/useBranchViewModel";
import { useEnumViewModel } from "@/modules/enums/viewModel/useEnumViewModel";
import { EnumCategory } from "@/modules/enums/types/enum.schemas";
import type { SubjectComboboxDTO } from "@/modules/subject-mapping/types/subject-mapping.types";

export function useAssignmentViewModel() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // --- 1. PBAC & AUTH STATES ---
  const [searchParams] = useSearchParams();
  const cloneId = searchParams.get("cloneId");

  const { user } = useAppSelector((state) => state.auth);
  const { hasPermission } = usePermissions();
  const canManageGlobal = hasPermission("assignment:manage-global");

  //  Fallback to empty string instead of undefined to satisfy Zod
  const defaultBranchId = !canManageGlobal ? (user?.branchId ?? "") : "";

  // --- 2. GLOBAL SETTINGS & DEPENDENCIES ---
  const { selectedYearId: activeAcademicYearId } = useSystemSettingsViewModel();
  const { enums: semesters, isLoading: isSemLoading } = useEnumViewModel(
    EnumCategory.SEMESTER,
  );
  const { enums: academicYears, isLoading: isYearLoading } = useEnumViewModel(
    EnumCategory.ACADEMIC_YEAR,
  );
  const { branches, isLoading: isBranchesLoading } = useBranchViewModel();

  // --- 3. FORM SETUP ---
  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentFormSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      subjectId: "",
      semesterId: "",
      branchId: defaultBranchId,
      attachmentId: null,
      academicYearId: activeAcademicYearId || "",
    },
  });

  const currentYearId = form.watch("academicYearId");
  const activeBranchId = canManageGlobal
    ? form.watch("branchId")
    : user?.branchId;
  const activeYearDisplay =
    academicYears?.find((y) => y.id === currentYearId)?.value || "Loading...";

  // --- 4. DATA FETCHING ---
  const { data: clonedAssignment, isLoading: isCloning } = useQuery({
    queryKey: ["assignment", cloneId],
    queryFn: () => fetchAssignmentById(cloneId!),
    enabled: !!cloneId,
  });

  const { data: mySubjects, isLoading: isMySubjectsLoading } = useQuery({
    queryKey: ["my-active-subjects", currentYearId],
    queryFn: () => fetchMyActiveSubjects(currentYearId as string),
    enabled: !canManageGlobal && !!currentYearId,
  });

  // --- 5. EFFECTS ---
  useEffect(() => {
    if (clonedAssignment && !isMySubjectsLoading) {
      const isSubjectStillAssigned =
        canManageGlobal ||
        (mySubjects || []).some(
          (sub: any) => sub.subjectId === clonedAssignment.subjectId,
        );

      if (!isSubjectStillAssigned && !canManageGlobal) {
        toastService.warning(
          "You are no longer assigned to the original subject. Please select a current subject.",
        );
      } else {
        toastService.success(
          "Assignment cloned! Please select a new Due Date.",
        );
      }

      form.reset({
        title: `${clonedAssignment.title} (Copy)`,
        description: clonedAssignment.description,
        subjectId: isSubjectStillAssigned ? clonedAssignment.subjectId : "",
        semesterId: isSubjectStillAssigned ? clonedAssignment.semesterId : "",
        branchId: clonedAssignment.branchId ?? "",
        attachmentId: clonedAssignment.attachmentId || null,
        academicYearId: activeAcademicYearId || "",
        dueDate: undefined as unknown as Date,
      });
    }
  }, [
    clonedAssignment,
    isMySubjectsLoading,
    mySubjects,
    activeAcademicYearId,
    form,
    canManageGlobal,
  ]);

  useEffect(() => {
    if (activeAcademicYearId && !cloneId) {
      form.setValue("academicYearId", activeAcademicYearId);
    }
  }, [activeAcademicYearId, form, cloneId]);

  // --- 6. HANDLERS ---
  const fetchSubjectsMemoized = useCallback(
    (term: string) =>
      searchSubjects(term, undefined, activeBranchId ?? undefined), //  Safely fallback null to undefined
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
    } else if (rawData?.semester && semesters) {
      const semString =
        typeof rawData.semester === "string"
          ? rawData.semester
          : (rawData.semester as any).value;
      const matchedSem = semesters.find(
        (s) => s.key === semString || s.value === semString,
      );
      if (matchedSem)
        form.setValue("semesterId", matchedSem.id, { shouldValidate: true });
    }
  };

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  // --- 7. MUTATIONS ---
  const createMutation = useMutation({
    mutationFn: createAssignment,
    onSuccess: () => {
      toastService.success("Assignment created successfully!");
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      navigate(-1);
    },
    onError: (error: any) => {
      toastService.error(
        error?.response?.data?.message || "Failed to create assignment.",
      );
    },
  });

  const onSubmit = async (values: AssignmentFormValues) => {
    try {
      let finalAttachmentId = values.attachmentId;
      let newlyUploadedFileId: string | null = null;

      if (selectedFile) {
        setIsUploadingFile(true);
        try {
          const uploadedFileResponse = await uploadAssignmentFile(
            selectedFile,
            "assignments",
          );
          finalAttachmentId = uploadedFileResponse.id;
          newlyUploadedFileId = uploadedFileResponse.id;
        } catch (error) {
          toastService.error("File upload failed. Please try again.");
          setIsUploadingFile(false);
          return;
        }
        setIsUploadingFile(false);
      }

      const finalPayload: AssignmentPayload = {
        title: values.title,
        description: values.description,
        subjectId: values.subjectId,
        branchId: values.branchId,
        semesterId: values.semesterId,
        academicYearId: values.academicYearId || null,
        dueDate: values.dueDate.toISOString(),
        attachmentId: finalAttachmentId,
      };

      try {
        await createMutation.mutateAsync(finalPayload);
      } catch (assignmentError) {
        if (newlyUploadedFileId) await deleteUploadedFile(newlyUploadedFileId);
      }
    } catch (error) {
      console.error("Critical Submission Error", error);
    }
  };

  return {
    form,
    navigate,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: createMutation.isPending || isUploadingFile,
    isCloning,

    // Dependencies & Auth
    canManageGlobal,
    activeBranchId,
    activeYearDisplay,
    branches,
    semesters,
    isPageLoading: isSemLoading || isYearLoading || isBranchesLoading,

    // Handlers
    fetchSubjectsMemoized,
    handleSubjectSelect,

    fileState: {
      file: selectedFile,
      setFile: setSelectedFile,
      isUploading: isUploadingFile,
      existingUrl: clonedAssignment?.attachmentUrl,
    },
    subjectState: {
      mySubjects: mySubjects || [],
      isLoading: isMySubjectsLoading,
    },
  };
}
