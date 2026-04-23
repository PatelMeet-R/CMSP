import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { toastService } from "@/core/toast/toastService";
import {
  fetchAssignmentById,
  deleteAssignment,
} from "../model/assignmentService";
import { useAppSelector } from "@/store/hook";
import { ROLES } from "@/core/Constants/enums/role-enum-value";
import { useState } from "react";

export function useAssignmentDetailViewModel() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAppSelector((state) => state.auth);

  const [assignmentToDelete, setAssignmentToDelete] = useState<{
    id: number;
    title: string;
  } | null>(null);

  const assignmentId = Number(id);

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

  // FRONTEND AUTHORIZATION LOGIC
  // Super Admins can edit/delete everything
  let canEditOrDelete = user?.role === ROLES.SUPER_ADMIN;

  if (assignment && user) {
    if (user.role === ROLES.HOD) {
      // HODs can manage anything in their branch
      // (Requires branchName match, or preferably branchId if added to DTO)
      canEditOrDelete = true;
    } else if (user.role === ROLES.PROFESSOR) {
      // Professors can only manage their own
      // NOTE: Requires 'createdBy' to be returned in backend DTO to work perfectly!
     
      canEditOrDelete = assignment.createdBy
        ? assignment.createdBy === user.id
        : true;
    }
  }

  return {
    assignment,
    isLoading,
    isError,
    isDeleting: deleteMutation.isPending,
    canEditOrDelete,
    navigate,
    //
    assignmentToDelete,
    setAssignmentToDelete,
    triggerDeleteModal,
    confirmDeletion,
  };
}
