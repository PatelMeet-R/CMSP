import { useAppSelector } from "@/store/hook";
import { useCallback, useMemo } from "react";

// =============================================
//  V2 Permission Hook — Permission-Based UI Rendering
//
//  Usage:
//    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
//
//    if (hasPermission("assignment:create")) { <ShowButton /> }
//    if (hasAnyPermission(["user:read", "user:manage-status"])) { <ShowTab /> }
// =============================================

export function usePermissions() {
  const user = useAppSelector((state) => state.auth.user);

  const permissionSet = useMemo(
    () => new Set(user?.permissions ?? []),
    [user?.permissions],
  );

  /** Check if user has a specific permission */
  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user) return false;
      // Super admin wildcard bypass
      if (permissionSet.has("*:*")) return true;
      return permissionSet.has(permission);
    },
    [user, permissionSet],
  );

  /** Check if user has ANY of the given permissions (OR logic) */
  const hasAnyPermission = useCallback(
    (permissions: string[]): boolean => {
      if (!user) return false;
      if (permissionSet.has("*:*")) return true;
      return permissions.some((p) => permissionSet.has(p));
    },
    [user, permissionSet],
  );

  /** Check if user has ALL of the given permissions (AND logic) */
  const hasAllPermissions = useCallback(
    (permissions: string[]): boolean => {
      if (!user) return false;
      if (permissionSet.has("*:*")) return true;
      return permissions.every((p) => permissionSet.has(p));
    },
    [user, permissionSet],
  );

  return {
    permissions: user?.permissions ?? [],
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    /** Convenience: current user's role name */
    role: user?.role ?? null,
    /** Convenience: is user a super admin */
    isSuperAdmin: permissionSet.has("*:*"),
  };
}
