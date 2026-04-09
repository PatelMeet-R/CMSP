import axiosInstance from "@/core/api/axiosInstance";
import { API_ENDPOINT } from "@/core/api/endPoint";

export const fetchUsersList = async (params: any) => {
  const response = await axiosInstance.get(API_ENDPOINT.PROFILE.VIEW_LIST, {
    params,
  });
  return response.data;
};

export const updateAccountStatus = async (id: number, statusKey: string) => {
  return await axiosInstance.patch(API_ENDPOINT.PROFILE.STATUS_UPDATE(id), {
    statusKey,
  });
};

export const updateUserRole = async (id: number, newRoleId: number) => {
  return await axiosInstance.patch(API_ENDPOINT.PROFILE.ROLE_UPDATE(id), {
    newRoleId,
  });
};


