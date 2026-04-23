import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { useSearchParams } from "react-router-dom";
import { fetchUsersList } from "@/modules/users/model/usersService";

export const useUserManagementViewModel = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // 🎛️ UI State
  const page = parseInt(searchParams.get("page") || "1", 10) || 1;
  const limit = parseInt(searchParams.get("limit") || "10", 10) || 10;
  const search = searchParams.get("search") || "";
  const roleId = searchParams.get("roleId") || undefined;

  const branchId = searchParams.get("branchId")
    ? Number(searchParams.get("branchId"))
    : undefined;
  const genderId = searchParams.get("genderId")
    ? Number(searchParams.get("genderId"))
    : undefined;

  // ⏱️ DEBOUNCE SEARCH
  const debouncedSearch = useDebounce(search, 800);

  // 🔗 UPDATE URL
  const setParam = (key: string, value: string | number | undefined) => {
    setSearchParams((prev) => {
      if (value) prev.set(key, value.toString());
      else prev.delete(key);
      return prev;
    });
  };

  // 🎯 SETTERS
  const setPage = (p: number) => setParam("page", p);
  const setLimit = (l: number) => setParam("limit", l);
  const setSearch = (s: string) => setParam("search", s);
  const setBranchId = (id: number | undefined) => setParam("branchId", id);
  const setRoleId = (id: string | undefined) => setParam("roleId", id);
  const setGenderId = (id: number | undefined) => setParam("genderId", id);

  // 🔄 Reset Pagination: Go to Page 1 on filter change
  useEffect(() => {
    if (page !== 1) setPage(1);
  }, [debouncedSearch, branchId, roleId, genderId, limit]);

  // 📦 Group params for API
  const queryParams = {
    page,
    limit,
    search: debouncedSearch || undefined,
    branchId,
    genderId,
    roleId: roleId ? Number(roleId) : undefined,
  };

  // 📡 Fetch Data
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["users", queryParams],
    queryFn: () => fetchUsersList(queryParams),
    enabled: !!queryParams.roleId, // Only fetch if we have a role tab selected
  });

  return {
    users: data?.items || [],
    meta: data?.meta || null,
    isLoading,
    isError,
    error,
    page,
    limit,
    search,
    branchId,
    roleId,
    genderId,
    setPage,
    setSearch,
    setBranchId,
    setRoleId,
    setGenderId,
    setLimit,
    clearFilters: () => setSearchParams(new URLSearchParams()),
  };
};
