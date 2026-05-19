import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { fetchMyAssignments } from "../model/assignmentService";
import { useDebounce } from "@/hooks/use-debounce";
import { useEnumViewModel } from "@/modules/enums/viewModel/useEnumViewModel";
import { EnumCategory } from "@/modules/enums/types/enum.schemas";
import { ROUTENAME } from "@/core/Constants/RouteName";

import type { AssignmentDTO } from "@/modules/assignment/types/assignment.schemas";
import type { PaginatedResponse } from "@/lib/interface/pagination.interface";

export function useMyAssignmentListViewModel() {
  const navigate = useNavigate();

  // --- 1. UI STATES ---
  const [search, setSearch] = useState("");
  const [academicYearId, setAcademicYearId] = useState<string | undefined>(
    undefined,
  );
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 1500);

  // --- 2. DATA FETCHING ---
  const { enums: academicYears } = useEnumViewModel(EnumCategory.ACADEMIC_YEAR);

  const { data, isLoading, isError } = useQuery<
    PaginatedResponse<AssignmentDTO>
  >({
    queryKey: ["my-assignments", debouncedSearch, academicYearId, page],
    queryFn: () =>
      fetchMyAssignments({
        page,
        limit: 10,
        search: debouncedSearch,
        academicYearId,
      }),
  });

  return {
    assignments: data?.items || [],
    meta: data?.meta,
    isLoading,
    isError,

    // Dependencies
    academicYears,
    navigate,
    ROUTENAME,

    filters: {
      search,
      setSearch,
      academicYearId,
      setAcademicYearId,
      page,
      setPage,
    },
  };
}
