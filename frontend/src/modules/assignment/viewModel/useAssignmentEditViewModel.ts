import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

import { toastService } from "@/core/toast/toastService";
import {
  assignmentFormSchema,
  type AssignmentFormValues,
  type UpdateAssignmentPayload,
  type AssignmentDTO,
} from "../types/assignment.schemas";
import {
  fetchAssignmentById,
  updateAssignment,
  uploadAssignmentFile,
} from "../model/assignmentService";
import { ROUTENAME } from "@/core/Constants/RouteName";

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export function useAssignmentEditViewModel() {
  const { id } = useParams<{ id: string }>();
  const assignmentId = id!;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  // Track if the user explicitly removed the existing file
  const [removedExistingFile, setRemovedExistingFile] = useState(false);

  // 1. Fetch Existing Data
  const { data: assignment, isLoading: isFetching } = useQuery<
    AssignmentDTO,
    Error
  >({
    queryKey: ["assignment", assignmentId],
    queryFn: () => fetchAssignmentById(assignmentId),
    enabled: !!assignmentId,
  });

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentFormSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      dueDate: undefined,
      subjectId: undefined,
      semesterId: undefined,
      branchId: undefined,
      academicYearId: undefined,
    },
  });

  useEffect(() => {
    form.register("subjectId");
    form.register("semesterId");
    form.register("branchId");
    form.register("academicYearId");

    if (assignment) {
      form.reset({
        title: assignment.title,
        description: assignment.description,
        dueDate: new Date(assignment.dueDate),
        subjectId: assignment.subjectId,
        branchId: assignment.branchId,
        semesterId: assignment.semesterId,
        academicYearId: assignment.academicYearId,
        attachmentId: assignment.attachmentId || null,
      });

      form.trigger();
    }
  }, [assignment, form]);

  // 3. Update Mutation
  const updateMutation = useMutation({
    mutationFn: (payload: UpdateAssignmentPayload) =>
      updateAssignment(assignmentId, payload),
    onSuccess: () => {
      toastService.success("Assignment updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      queryClient.invalidateQueries({ queryKey: ["assignment", assignmentId] });
      navigate(
        ROUTENAME.VIEW_ASSIGNMENT.replace(":id", assignmentId.toString()),
      );
    },
    onError: (error: ApiError) => {
      toastService.error(
        error?.response?.data?.message || "Failed to update assignment.",
      );
    },
  });

  // 4. Handle Submit
  const onSubmit = async (values: AssignmentFormValues) => {
    try {
      // Create a Partial payload so we only send what we need
      const finalPayload: UpdateAssignmentPayload = {
        title: values.title,
        description: values.description,
        dueDate: values.dueDate.toISOString(),
        subjectId: values.subjectId,
        semesterId: values.semesterId,
      };

      // FILE LOGIC
      if (selectedFile) {
        // Case A: User uploaded a brand NEW file
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
        // Case B: User clicked 'X' on the old file, but didn't upload a new one
        // The backend expects `null` to physically delete the relation
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
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: updateMutation.isPending || isUploadingFile,
    fileState: {
      file: selectedFile,
      setFile: setSelectedFile,
      existingUrl: assignment?.attachmentUrl,
      removedExistingFile,
      setRemovedExistingFile,
    },
    navigate,
  };
}
