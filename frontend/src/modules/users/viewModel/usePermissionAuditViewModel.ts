import { useQuery } from "@tanstack/react-query";
import { usePermissions } from "@/hooks/usePermissions";
import { fetchUserPermissionAuditLogs } from "@/modules/users/model/permissionAuditService";

export const usePermissionAuditViewModel = (targetUserId: string) => {
  const { hasPermission } = usePermissions();
  const canViewAudit =
    hasPermission("user:manage-permissions") || hasPermission("audit:read");

  const {
    data: auditLogs,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["permission-audit", targetUserId],
    queryFn: () => fetchUserPermissionAuditLogs(targetUserId),
    enabled: !!targetUserId && canViewAudit,
  });

  return {
    auditLogs: auditLogs || [],
    isLoading,
    isError,
    canViewAudit,
  };
};
