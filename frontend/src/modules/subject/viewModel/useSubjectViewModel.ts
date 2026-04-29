import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { fetchSubjects } from "@/modules/subject/model/subjectService";
import { useSearchParams } from "react-router-dom";

export const useSubjectViewModel = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  //  UI State
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const search = searchParams.get("search") || "";
  const branchId = searchParams.get("branchId") || undefined;
  const semesterId = searchParams.get("semesterId") || undefined;

  //  DEBOUNCE SEARCH
  const debouncedSearch = useDebounce(search, 1500);

  //  UPDATE URL
  const setParam = (key: string, value: string | number | undefined) => {
    setSearchParams((prev) => {
      if (value) prev.set(key, value.toString());
      else prev.delete(key);
      return prev;
    });
  };

  const setPage = (p: number) => setParam("page", p);
  const setLimit = (l: number) => setParam("limit", l);
  const setSearch = (s: string) => setParam("search", s);
  const setBranchId = (id: string | undefined) => setParam("branchId", id);
  const setSemesterId = (id: string | undefined) => setParam("semesterId", id);

  //  Reset Pagination: If a user types a new search or changes a filter, go back to Page 1
  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
  }, [debouncedSearch, branchId, semesterId, limit]);

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
    setLimit,

    // Helper Action
    clearFilters: () => {
      setSearchParams(new URLSearchParams());
    },
  };
};
