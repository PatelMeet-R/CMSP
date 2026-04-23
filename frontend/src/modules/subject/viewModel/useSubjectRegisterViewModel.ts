import { toastService } from "@/core/toast/toastService";
import { createSubjectDetails } from "@/modules/subject/model/subjectService";
import type { CreateSubjectPayload } from "@/modules/subject/types/subject.schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useSubjectRegisterViewModel = () => {
  const queryClient = useQueryClient();

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
    isCreating: createMutation.isPending,
    createSubject: createMutation.mutateAsync,
  };
};
