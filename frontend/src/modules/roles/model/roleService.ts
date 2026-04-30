import axiosInstance from "@/core/api/axiosInstance";
import type {
  RolePermissionMatrixResponse,
  RoleResponse,
} from "../types/role.schemas";
import { API_ENDPOINT } from "@/core/api/endPoint";

export const fetchAllRoles = async (): Promise<RoleResponse[]> => {
  const response = await axiosInstance.get(API_ENDPOINT.ROLES);
  return response.data.data;
};

// Fetch the base matrix for a role
export const fetchRolePermissions = async (
  roleId: string,
): Promise<RolePermissionMatrixResponse> => {
  const response = await axiosInstance.get(`/roles/${roleId}/permissions`);
  return response.data.data;
};

export const updateRolePermissions = async (
  roleId: string,
  permissionSlugs: string[],
) => {
  const response = await axiosInstance.put(`/roles/${roleId}/permissions`, {
    permissionSlugs,
  });
  return response.data;
};
