import axiosInstance from "@/core/api/axiosInstance";
import type { PermissionAuditLog } from "@/modules/users/types/permission-audit.interface";

export const fetchUserPermissionAuditLogs = async (
  targetUserId: string,
): Promise<PermissionAuditLog[]> => {
  const response = await axiosInstance.get(
    `/permission-audit/user/${targetUserId}`,
  );
  return response.data.data;
};
