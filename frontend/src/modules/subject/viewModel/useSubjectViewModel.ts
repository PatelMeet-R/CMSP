import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { fetchSubjects } from "@/modules/subject/model/subjectService";

export const useSubjectViewModel = () => {
  //  UI State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [branchId, setBranchId] = useState<number | undefined>();
  const [semesterId, setSemesterId] = useState<number | undefined>();

  //  Debounce the search
  const debouncedSearch = useDebounce(search, 1500);

  //  Reset Pagination: If a user types a new search or changes a filter, go back to Page 1
  useEffect(() => {
    console.log("🔄 [VIEWMODEL] Filter changed! Resetting page to 1.");
    setPage(1);
  }, [debouncedSearch, branchId, semesterId]);

  //  Group params to pass to API
  const queryParams = {
    page,
    limit,
    search: debouncedSearch || undefined,
    branchId,
    semesterId,
  };

  //  Fetch Data via React Query
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["subjects", queryParams],
    queryFn: () => fetchSubjects(queryParams),
  });

  //  Return a clean object for the UI to consume
  return {
    // Data
    subjects: data?.items || [],
    meta: data?.meta || null,
    isLoading,
    isError,
    error,

    // State Values (for inputs to read)
    page,
    search,
    branchId,
    semesterId,

    // Actions (for inputs to trigger)
    setPage,
    setSearch,
    setBranchId,
    setSemesterId,

    // Helper Action
    clearFilters: () => {
      setSearch("");
      setBranchId(undefined);
      setSemesterId(undefined);
      setPage(1);
    },
  };
};
