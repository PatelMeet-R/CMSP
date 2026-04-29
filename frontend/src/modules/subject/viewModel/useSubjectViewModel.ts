import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { fetchSubjects } from "@/modules/subject/model/subjectService";
import { useSearchParams } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";
import { useBranchViewModel } from "@/modules/branch/viewModel/useBranchViewModel";
import { useEnumViewModel } from "@/modules/enums/viewModel/useEnumViewModel";
import { EnumCategory } from "@/modules/enums/types/enum.schemas";
import type {
  BranchResponse,
  SemesterResponse,
} from "@/modules/subject/types/subject.schemas";
import { useSubjectViewModelSearch_debounce_delay } from "@/core/Constants/time.contant";

export const useSubjectViewModel = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // --- 1. PBAC PERMISSIONS ---
  const { hasPermission } = usePermissions();
  const canManageGlobal = hasPermission("subject:manage-global");

  // --- 2. EXTERNAL DEPENDENCIES (Dropdowns) ---
  const { branches, isLoading: isBranchesLoading } = useBranchViewModel();
  const { enums: semesters, isLoading: isSemestersLoading } = useEnumViewModel(
    EnumCategory.SEMESTER,
  );

  // Format options for the UI
  const branchOptions =
    branches?.map((b: BranchResponse) => ({ id: b.id, label: b.name })) || [];
  const semesterOptions =
    semesters?.map((s: SemesterResponse) => ({ id: s.id, label: s.value })) ||
    [];

  // --- 3. UI STATE (URL Params) ---
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const search = searchParams.get("search") || "";
  const branchId = searchParams.get("branchId") || undefined;
  const semesterId = searchParams.get("semesterId") || undefined;

  const debouncedSearch = useDebounce(
    search,
    useSubjectViewModelSearch_debounce_delay || 1500,
  );

  // Computed State for UI
  const hasActiveFilters = Boolean(search || branchId || semesterId);

  // --- 4. ACTIONS ---
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
  const clearFilters = () => setSearchParams(new URLSearchParams());

  // Reset Pagination on filter change
  useEffect(() => {
    if (page !== 1) setPage(1);
  }, [debouncedSearch, branchId, semesterId, limit]);

  const queryParams = {
    page,
    limit,
    search: debouncedSearch || undefined,
    branchId,
    semesterId,
  };

  // --- 5. DATA FETCHING ---
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["subjects", queryParams],
    queryFn: () => fetchSubjects(queryParams),
  });

  // --- 6. EXPOSE CLEAN INTERFACE TO VIEW ---
  return {
    // Data
    subjects: data?.items || [],
    meta: data?.meta || null,
    isLoading,
    isError,
    error,

    // UI Configuration
    canManageGlobal,
    branchOptions,
    isBranchesLoading,
    semesterOptions,
    isSemestersLoading,
    hasActiveFilters,

    // State Values
    page,
    search,
    branchId,
    semesterId,

    // Actions
    setPage,
    setSearch,
    setBranchId,
    setSemesterId,
    setLimit,
    clearFilters,
  };
};
