import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { toastService } from "@/core/toast/toastService";
import { getAxiosErrorMessage } from "@/core/helper/errorMessage";
import { usePermissions } from "@/hooks/usePermissions";
import {
  fetchRolePermissions,
  updateRolePermissions,
} from "@/modules/roles/model/roleService";
import type { RolePermissionItem } from "@/modules/roles/types/role.schemas";

export function useRolePermissionViewModel(roleId: string | undefined) {
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();

  const canManageGlobal = hasPermission("user:manage-global");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set());

  // 1. Fetch the data
  const {
    data: matrixData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["role-permissions", roleId],
    queryFn: () => fetchRolePermissions(roleId!),
    enabled: !!roleId && canManageGlobal,
  });

  // 2. Sync fetched data to local state
  useEffect(() => {
    if (matrixData) {
      const initialSlugs = new Set(
        matrixData.permissions.filter((p) => p.isGranted).map((p) => p.slug),
      );
      setSelectedSlugs(initialSlugs);
    }
  }, [matrixData]);

  // 3. Local Filtering & Grouping (Fixes Type Error 3)
  const filteredGroups = useMemo(() => {
    const groups = new Map<string, RolePermissionItem[]>();
    if (!matrixData) return groups;

    let items = matrixData.permissions;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter((item) => item.slug.toLowerCase().includes(q));
    }

    // Group locally to perfectly match RolePermissionItem
    items.forEach((item) => {
      if (!groups.has(item.resource)) {
        groups.set(item.resource, []);
      }
      groups.get(item.resource)!.push(item);
    });

    return groups;
  }, [matrixData, searchQuery]);

  // 4. Toggle Handler
  const handleToggle = (slug: string, isChecked: boolean) => {
    setSelectedSlugs((prev) => {
      const next = new Set(prev);
      if (isChecked) next.add(slug);
      else next.delete(slug);
      return next;
    });
  };

  // 5. Check if local state differs from backend state
  const isDirty = useMemo(() => {
    if (!matrixData) return false;
    const originalSlugs = matrixData.permissions
      .filter((p) => p.isGranted)
      .map((p) => p.slug);

    if (originalSlugs.length !== selectedSlugs.size) return true;
    for (const slug of originalSlugs) {
      if (!selectedSlugs.has(slug)) return true;
    }
    return false;
  }, [matrixData, selectedSlugs]);

  // 6. Save Mutation
  const saveMutation = useMutation({
    mutationFn: () => updateRolePermissions(roleId!, Array.from(selectedSlugs)),
    onSuccess: (data) => {
      toastService.success(data.message || "Role permissions updated!");
      queryClient.invalidateQueries({ queryKey: ["role-permissions", roleId] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      toastService.error(getAxiosErrorMessage(error.message));
    },
  });

  return {
    canManageGlobal,
    roleName: matrixData?.role.name,
    isLoading,
    isError,
    searchQuery,
    setSearchQuery,
    filteredGroups,
    selectedSlugs,
    handleToggle,
    isDirty,
    isSaving: saveMutation.isPending,
    handleSave: () => saveMutation.mutate(),
  };
}
