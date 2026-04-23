import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchMyAssignments } from "../model/assignmentService";
import { useDebounce } from "@/hooks/use-debounce";
import type { AssignmentDTO } from "@/modules/assignment/types/assignment.schemas";
import type { PaginatedResponse } from "@/lib/interface/pagination.interface";

export function useMyAssignmentListViewModel() {
  const [search, setSearch] = useState("");
  const [academicYearId, setAcademicYearId] = useState<number | undefined>(
    undefined,
  );
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 1500);

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
