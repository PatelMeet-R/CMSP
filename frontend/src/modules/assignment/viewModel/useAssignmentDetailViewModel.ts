import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { toastService } from "@/core/toast/toastService";
import {
  fetchAssignmentById,
  deleteAssignment,
} from "../model/assignmentService";
import { useAppSelector } from "@/store/hook";
import { useState } from "react";
import { usePermissions } from "@/hooks/usePermissions";

export function useAssignmentDetailViewModel() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAppSelector((state) => state.auth);

  const assignmentId = id!;

  const [assignmentToDelete, setAssignmentToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // Fetch Assignment Details
  const {
    data: assignment,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["assignment", assignmentId],
    queryFn: () => fetchAssignmentById(assignmentId),
    enabled: !!assignmentId,
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: deleteAssignment,
    onSuccess: () => {
      toastService.success("Assignment deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      navigate(-1);
    },
    onError: (error: any) => {
      toastService.error(
        error?.response?.data?.message || "Failed to delete assignment.",
      );
    },
  });

  const triggerDeleteModal = () => {
    if (assignment) {
      setAssignmentToDelete({ id: assignment.id, title: assignment.title });
    }
  };

  const confirmDeletion = () => {
    if (assignmentToDelete) {
      deleteMutation.mutate(assignmentToDelete.id);
      setAssignmentToDelete(null); // Close the modal
    }
  };

  // 🚨 PBAC AUTHORIZATION LOGIC
  const { hasPermission } = usePermissions();
  const canManageGlobal = hasPermission("assignment:manage-global");
  const canManageOthers = hasPermission("assignment:manage-others");

  let canModify = false;
  if (assignment && user) {
    const isCreator = assignment.createdBy === user.id;
    if (canManageGlobal || canManageOthers || isCreator) {
      canModify = true;
    }
  }

  return {
    assignment,
    isLoading,
    isError,
    isDeleting: deleteMutation.isPending,
    canModify, 
    navigate,
    assignmentToDelete,
    setAssignmentToDelete,
    triggerDeleteModal,
    confirmDeletion,
  };
}
