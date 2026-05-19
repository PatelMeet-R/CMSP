import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import {
  fetchAllAssignments,
  fetchMyAssignments,
} from "../model/assignmentService";
import { useSystemSettingsViewModel } from "@/modules/settings/viewModel/useSystemSettingsViewModel";
import { useDebounce } from "@/hooks/use-debounce";
import { usePermissions } from "@/hooks/usePermissions";
import { useEnumViewModel } from "@/modules/enums/viewModel/useEnumViewModel";
import { EnumCategory } from "@/modules/enums/types/enum.schemas";
import { useBranchViewModel } from "@/modules/branch/viewModel/useBranchViewModel";
import { ROUTENAME } from "@/core/Constants/RouteName";

import type { AssignmentDTO } from "@/modules/assignment/types/assignment.schemas";
import type { PaginatedResponse } from "@/lib/interface/pagination.interface";

export function useAssignmentListViewModel() {
  const navigate = useNavigate();
  const { selectedYearId } = useSystemSettingsViewModel();

  // --- 1. PBAC PERMISSIONS ---
  const { hasPermission } = usePermissions();
  const canManageGlobal = hasPermission("assignment:manage-global");
  const canCreate = hasPermission("assignment:create");
  const canReadSelf = hasPermission("assignment:read-self");

  // --- 2. EXTERNAL DEPENDENCIES (Dropdowns) ---
  const { enums: academicYears } = useEnumViewModel(EnumCategory.ACADEMIC_YEAR);
  const { branches } = useBranchViewModel();

  // --- 3. UI & FILTER STATES ---
  const [search, setSearch] = useState("");
  const [branchId, setBranchId] = useState<string | undefined>(undefined);
  const [academicYearId, setAcademicYearId] = useState<string | undefined>(
    selectedYearId?.toString(),
  );
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 500);

  // --- 4. DATA FETCHING ---
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

  // Check if they have personal assignments (to show "My Assignments" button)
  const { data: myAssignmentsCheck } = useQuery({
    queryKey: ["my-assignments-check"],
    queryFn: () => fetchMyAssignments({ page: 1, limit: 1 }),
    enabled: canReadSelf, //  PBAC replaced Role check
  });

  const hasCreatedAssignments = (myAssignmentsCheck?.meta?.totalItems || 0) > 0;

  // --- 5. EXPOSE INTERFACE ---
  return {
    assignments: data?.items || [],
    meta: data?.meta,
    isLoading,
    isError,

    // Dependencies & Status
    hasCreatedAssignments,
    canManageGlobal,
    canCreate,
    academicYears,
    branches,
    navigate,
    ROUTENAME,

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
