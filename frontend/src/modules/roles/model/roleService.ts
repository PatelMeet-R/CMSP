import axiosInstance from "@/core/api/axiosInstance";
import type { RoleResponse } from "../types/role.schemas";
import { API_ENDPOINT } from "@/core/api/endPoint";

export const fetchAllRoles = async (): Promise<RoleResponse[]> => {
  const response = await axiosInstance.get(API_ENDPOINT.ROLES);
  return response.data.data;
};
