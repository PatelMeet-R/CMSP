import { toastService } from "@/core/toast/toastService";
import {
  getSubjectDetails,
  updateSubjectDetails,
} from "@/modules/subject/model/subjectService";
import type {
  SubjectDetails,
  UpdateSubjectPayload,
} from "@/modules/subject/types/subject.schemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useSubjectDetailViewModel = (id: number | undefined) => {
  const queryClient = useQueryClient();

  const {
    data: subject,
    isLoading: isFetching,
    isError,
    error,
  } = useQuery<SubjectDetails>({
    queryKey: ["subject", id],
    queryFn: () => getSubjectDetails(id!),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (updatedData: UpdateSubjectPayload) =>
      updateSubjectDetails(id!, updatedData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subject", id] });
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      toastService.success("Subject updated successfully !");
    },
    onError: (err) => {
      toastService.error(err.message || "Failed to update subject");
    },
  });
  return {
    subject,
    isFetching,
    isUpdating: updateMutation.isPending,
    isError,
    error,
    updateSubject: updateMutation.mutateAsync,
  };
};
