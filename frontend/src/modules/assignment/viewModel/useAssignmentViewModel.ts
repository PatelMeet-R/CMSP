import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toastService } from "@/core/toast/toastService";

import {
  uploadAssignmentFile,
  createAssignment,
  deleteUploadedFile,
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
  const { user } = useAppSelector((state) => state.auth);
  const { selectedYearId: activeAcademicYearId } = useSystemSettingsViewModel();

  // 1. Hold the physical file in memory before uploading
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const defaultBranchId =
    user?.role !== ROLES.SUPER_ADMIN ? user?.branchId : undefined;

  // 2. Setup React Hook Form
  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentFormSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      subjectId: undefined as unknown as number,
      semesterId: undefined as unknown as number,
      branchId: defaultBranchId,
      attachmentId: null,
      academicYearId: activeAcademicYearId || undefined,
    },
  });

  // 3. Create Assignment Mutation
  const createMutation = useMutation({
    mutationFn: createAssignment,
    onSuccess: () => {
      toastService.success("Assignment created successfully!");
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      form.reset({
        title: "",
        description: "",
        subjectId: undefined as unknown as number,
        semesterId: undefined as unknown as number,
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

  // 4. The Master Submit Handler (Handles File Upload FIRST, then Assignment)
  const onSubmit = async (values: AssignmentFormValues) => {
    try {
      let finalAttachmentId = values.attachmentId;
      let newlyUploadedFileId: number | null = null;

      // STEP 1: Upload the file
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
          return; // Stop the form submission if file upload fails
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
            console.error(
              "Failed to delete ghost file. Manual cleanup may be required.",
              cleanupError,
            );
          }
        }
      }
    } catch (error) {
      console.error("Critical Submission Error", error);
    }
  };

  useEffect(() => {
    if (activeAcademicYearId) {
      form.setValue("academicYearId", activeAcademicYearId);
    }
  }, [activeAcademicYearId, form]);

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: createMutation.isPending || isUploadingFile,
    fileState: {
      file: selectedFile,
      setFile: setSelectedFile,
      isUploading: isUploadingFile,
    },
  };
}
