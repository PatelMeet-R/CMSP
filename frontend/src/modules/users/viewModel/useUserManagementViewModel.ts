import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce"; //
import { useSearchParams } from "react-router-dom";
import { fetchUsersList } from "@/modules/users/model/usersService";

export const useUserManagementViewModel = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  //  UI State
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const search = searchParams.get("search") || "";
  const roleId = searchParams.get("roleId") || undefined;
  const branchId = searchParams.get("branchId")
    ? Number(searchParams.get("branchId"))
    : undefined;
  const genderId = searchParams.get("genderId")
    ? Number(searchParams.get("genderId"))
    : undefined;

  //  DEBOUNCE SEARCH
  const debouncedSearch = useDebounce(search, 1000);

  //  UPDATE URL
  const setParam = (key: string, value: string | number | undefined) => {
    setSearchParams((prev) => {
      if (value) prev.set(key, value.toString());
      else prev.delete(key);
      return prev;
    });
  };

  //  SETTERS
  const setPage = (p: number) => setParam("page", p);
  const setLimit = (l: number) => setParam("limit", l);
  const setSearch = (s: string) => setParam("search", s);
  const setBranchId = (id: number | undefined) => setParam("branchId", id);
  const setRoleId = (id: string | undefined) => setParam("roleId", id);
  const setGenderId = (id: number | undefined) => setParam("genderId", id);

  //  Reset Pagination: If a user types a search or changes a filter, go back to Page 1
  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
  }, [debouncedSearch, branchId, roleId, genderId, limit]);

  //  Group params to pass to API
  const queryParams = {
    page,
    limit,
    search: debouncedSearch || undefined,
    branchId,
    genderId,
    roleId: roleId ? Number(roleId) : undefined,
  };

  //  Fetch Data via React Query
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["users", queryParams],
    queryFn: () => fetchUsersList(queryParams),
    enabled: !!queryParams.roleId,
  });

  //  Return a clean object for the UI to consume
  return {
    // Data
    users: data?.items || [],
    meta: data?.meta || null,
    isLoading,
    isError,
    error,

    // State Values
    page,
    limit,
    search,
    branchId,
    roleId,
    genderId,

    // Actions
    setPage,
    setSearch,
    setBranchId,
    setRoleId,
    setGenderId,
    setLimit,

    // Helper Action
    clearFilters: () => {
      setSearchParams(new URLSearchParams());
    },
  };
};
