import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toastService } from "@/core/toast/toastService";
import { useSearchParams } from "react-router-dom";

import {
  uploadAssignmentFile,
  createAssignment,
  deleteUploadedFile,
  fetchMyActiveSubjects,
  fetchAssignmentById,
} from "../model/assignmentService";
import {
  assignmentFormSchema,
  type AssignmentFormValues,
  type AssignmentPayload,
} from "@/modules/assignment/types/assignment.schemas";
import { useAppSelector } from "@/store/hook";
import { ROLES } from "@/core/Constants/enums/role-enum-value";
import { useSystemSettingsViewModel } from "@/modules/settings/viewModel/useSystemSettingsViewModel";

export function useAssignmentViewModel() {
  const queryClient = useQueryClient();

  // 1. URL & Auth States
  const [searchParams] = useSearchParams();
  const cloneId = searchParams.get("cloneId");
  const { user } = useAppSelector((state) => state.auth);
  const { selectedYearId: activeAcademicYearId } = useSystemSettingsViewModel();

  const isSuperAdmin = user?.role === ROLES.SUPER_ADMIN;
  const defaultBranchId = !isSuperAdmin ? user?.branchId : undefined;

  // 2. Form Setup
  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentFormSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      subjectId: undefined as unknown as string,
      semesterId: undefined as unknown as string,
      branchId: defaultBranchId,
      attachmentId: null,
      academicYearId: activeAcademicYearId || undefined,
    },
  });

  const currentYearId = form.watch("academicYearId");

  // 3. 🚀 Data Fetching (Moved ABOVE the useEffects)
  const { data: clonedAssignment, isLoading: isCloning } = useQuery({
    queryKey: ["assignment", cloneId],
    queryFn: () => fetchAssignmentById(cloneId!),
    enabled: !!cloneId,
  });

  const { data: mySubjects, isLoading: isMySubjectsLoading } = useQuery({
    queryKey: ["my-active-subjects", currentYearId],
    queryFn: () => fetchMyActiveSubjects(currentYearId as string),
    enabled: !isSuperAdmin && !!currentYearId,
  });

  // 4. 🚀 The SMART Clone Effect (Now has access to mySubjects)
  useEffect(() => {
    // Wait until both the cloned data AND the professor's current subjects are loaded
    if (clonedAssignment && !isMySubjectsLoading) {
      // Check if the old subject is still in their active assigned subjects list
      const isSubjectStillAssigned =
        isSuperAdmin ||
        (mySubjects || []).some(
          (sub: any) => sub.subjectId === clonedAssignment.subjectId,
        );

      // Warning if they don't teach it anymore
      if (!isSubjectStillAssigned && !isSuperAdmin) {
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

        // 🚀 THE FIX: Only auto-fill if they still teach it! Otherwise, force them to pick.
        subjectId: isSubjectStillAssigned
          ? clonedAssignment.subjectId
          : (undefined as unknown as string),
        semesterId: isSubjectStillAssigned
          ? clonedAssignment.semesterId
          : (undefined as unknown as string),

        branchId: clonedAssignment.branchId,
        attachmentId: clonedAssignment.attachmentId || null,

        academicYearId: activeAcademicYearId || undefined,
        dueDate: undefined as unknown as Date,
      });
    }
  }, [
    clonedAssignment,
    isMySubjectsLoading,
    mySubjects,
    activeAcademicYearId,
    form,
    isSuperAdmin,
  ]);

  // 5. Initial Year Sync Effect
  useEffect(() => {
    if (activeAcademicYearId && !cloneId) {
      form.setValue("academicYearId", activeAcademicYearId);
    }
  }, [activeAcademicYearId, form, cloneId]);

  // 6. File & Upload States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  // 7. Create Mutation
  const createMutation = useMutation({
    mutationFn: createAssignment,
    onSuccess: () => {
      toastService.success("Assignment created successfully!");
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      form.reset({
        title: "",
        description: "",
        subjectId: undefined as unknown as string,
        semesterId: undefined as unknown as string,
        attachmentId: null,
        branchId: defaultBranchId,
        academicYearId: activeAcademicYearId || undefined,
      });
      setSelectedFile(null);
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message || "Failed to create assignment.";
      toastService.error(msg);
    },
  });

  // 8. Submit Handler
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
        academicYearId: values.academicYearId,
        dueDate: values.dueDate.toISOString(),
        attachmentId: finalAttachmentId,
      };

      try {
        await createMutation.mutateAsync(finalPayload);
      } catch (assignmentError) {
        if (newlyUploadedFileId) {
          console.warn(
            "Assignment creation failed. Rolling back uploaded file...",
          );
          try {
            await deleteUploadedFile(newlyUploadedFileId);
            console.log("Ghost file successfully deleted.");
          } catch (cleanupError) {
            console.error("Failed to delete ghost file.", cleanupError);
          }
        }
      }
    } catch (error) {
      console.error("Critical Submission Error", error);
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: createMutation.isPending || isUploadingFile,
    isCloning,
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
