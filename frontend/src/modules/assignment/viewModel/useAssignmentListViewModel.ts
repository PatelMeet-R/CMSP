import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllAssignments } from "../model/assignmentService";
import { useSystemSettingsViewModel } from "@/modules/settings/viewModel/useSystemSettingsViewModel";
import { useDebounce } from "@/hooks/use-debounce";

import type { AssignmentDTO } from "@/modules/assignment/types/assignment.schemas";
import type { PaginatedResponse } from "@/lib/interface/pagination.interface";

export function useAssignmentListViewModel() {
  const { selectedYearId } = useSystemSettingsViewModel();

  // 🚀 Filter States
  const [search, setSearch] = useState("");
  const [branchId, setBranchId] = useState<number | undefined>(undefined);
  const [academicYearId, setAcademicYearId] = useState<number | undefined>(
    selectedYearId,
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

  return {
    // Backend returns { items: [], meta: {} }
    assignments: data?.items || [],
    meta: data?.meta,
    isLoading,
    isError,

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
