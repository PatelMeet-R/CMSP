import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchAllAssignments,
  fetchMyAssignments,
} from "../model/assignmentService";
import { useSystemSettingsViewModel } from "@/modules/settings/viewModel/useSystemSettingsViewModel";
import { useDebounce } from "@/hooks/use-debounce";

import type { AssignmentDTO } from "@/modules/assignment/types/assignment.schemas";
import type { PaginatedResponse } from "@/lib/interface/pagination.interface";
import { useAppSelector } from "@/store/hook";
import { ROLES } from "@/core/Constants/enums/role-enum-value";

export function useAssignmentListViewModel() {
  const { user } = useAppSelector((state) => state.auth);
  const { selectedYearId } = useSystemSettingsViewModel();

  // 🚀 Filter States
  const [search, setSearch] = useState("");
  const [branchId, setBranchId] = useState<string | undefined>(undefined);
  const [academicYearId, setAcademicYearId] = useState<string | undefined>(
    selectedYearId?.toString(),
  );
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading, isError } = useQuery<
    PaginatedResponse<AssignmentDTO>
  >({
    queryKey: ["assignments", debouncedSearch, branchId, academicYearId, page],
    queryFn: () =>
      fetchAllAssignments({
        page,
        limit: 10,
        search: debouncedSearch,
        branchId,
        academicYearId,
      }),
  });
  const { data: myAssignmentsCheck } = useQuery({
    queryKey: ["my-assignments-check"],
    queryFn: () => fetchMyAssignments({ page: 1, limit: 1 }),
    enabled: user?.role === ROLES.PROFESSOR || user?.role === ROLES.HOD,
  });
  const hasCreatedAssignments = (myAssignmentsCheck?.meta?.totalItems || 0) > 0;

  return {
    // Backend returns { items: [], meta: {} }
    assignments: data?.items || [],
    meta: data?.meta,
    isLoading,
    isError,

    hasCreatedAssignments,

    // UI Controls
    filters: {
      search,
      setSearch,
      branchId,
      setBranchId,
      academicYearId,
      setAcademicYearId,
      page,
      setPage,
    },
  };
}
