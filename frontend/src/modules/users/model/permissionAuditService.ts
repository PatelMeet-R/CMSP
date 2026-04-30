import axiosInstance from "@/core/api/axiosInstance";
import { API_ENDPOINT } from "@/core/api/endPoint";
import type { PermissionAuditLog } from "@/modules/users/types/permission-audit.interface";

export const fetchUserPermissionAuditLogs = async (
  targetUserId: string,
): Promise<PermissionAuditLog[]> => {
  const response = await axiosInstance.get(
    API_ENDPOINT.PERMISSION.GET_AUDIT(targetUserId),
  );
  return response.data.data;
};
