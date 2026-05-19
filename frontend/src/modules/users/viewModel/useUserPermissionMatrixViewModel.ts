import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePermissions } from "@/hooks/usePermissions";
import { fetchPermissionMatrix } from "@/modules/users/model/usersService";
import type {
  LocalOverride,
  PermissionMatrixItem,
} from "@/modules/users/types/permission.interface";
import { groupByResource } from "@/lib/permission.utils";

export function useUserPermissionMatrixViewModel(personalInfoId: string) {
  const { hasPermission } = usePermissions();
  const canManage = hasPermission("user:manage-permissions");

  const queryClient = useQueryClient();
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [localOverrides, setLocalOverrides] = useState<
    Map<string, LocalOverride>
  >(new Map());

  const {
    data: matrix,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["permission-matrix", personalInfoId],
    queryFn: () => fetchPermissionMatrix(personalInfoId),
    enabled: !!personalInfoId && canManage,
    staleTime: 30_000,
  });

  const dirtyCount = localOverrides.size;

  const filterBySearch = (items: PermissionMatrixItem[]) => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter((item) => item.slug.toLowerCase().includes(q));
  };

  const filteredBase = useMemo(
    () =>
      groupByResource(
        filterBySearch(matrix?.section1_baseRolePermissions || []),
      ),
    [matrix?.section1_baseRolePermissions, searchQuery],
  );

  const filteredExtra = useMemo(
    () =>
      groupByResource(
        filterBySearch(matrix?.section2_extraAssignablePermissions || []),
      ),
    [matrix?.section2_extraAssignablePermissions, searchQuery],
  );

  function getEffectiveChecked(item: PermissionMatrixItem): boolean {
    const override = localOverrides.get(item.slug);
    if (!override) return item.isChecked;

    if (override.state === "revoke") return false;
    if (override.state === "grant") return true;
    return item.isChecked;
  }

  function handleToggle(
    item: PermissionMatrixItem,
    isBaseSection: boolean,
    newChecked: boolean,
  ) {
    setLocalOverrides((prev) => {
      const next = new Map(prev);

      if (isBaseSection) {
        if (!newChecked) {
          next.set(item.slug, { slug: item.slug, state: "revoke" });
        } else {
          if (item.isChecked) {
            next.delete(item.slug);
          } else {
            next.set(item.slug, { slug: item.slug, state: "default" });
          }
        }
      } else {
        if (newChecked) {
          next.set(item.slug, { slug: item.slug, state: "grant" });
        } else {
          if (!item.isChecked) {
            next.delete(item.slug);
          } else {
            next.set(item.slug, { slug: item.slug, state: "default" });
          }
        }
      }

      return next;
    });
  }

  const handleSaveSuccess = () => {
    setIsSaveDialogOpen(false);
    setLocalOverrides(new Map());
    queryClient.invalidateQueries({
      queryKey: ["permission-matrix", personalInfoId],
    });
  };

  return {
    canManage,
    isLoading,
    isError,
    matrix,
    dirtyCount,
    searchQuery,
    setSearchQuery,
    filteredBase,
    filteredExtra,
    localOverrides,
    isSaveDialogOpen,
    setIsSaveDialogOpen,
    getEffectiveChecked,
    handleToggle,
    handleSaveSuccess,
  };
}
