import axiosInstance from "@/core/api/axiosInstance";
import { API_ENDPOINT } from "@/core/api/endPoint";
import type {
  FetchUsersQueryParams,
  PaginatedUserResponse,
  StaffRegisterFormValues,
  UpdateProfileFormValues,
} from "@/modules/users/types/users.schemas";

export const fetchUsersList = async (
  params: FetchUsersQueryParams,
): Promise<PaginatedUserResponse> => {
  const response = await axiosInstance.get(API_ENDPOINT.PROFILE.VIEW_LIST, {
    params,
  });
  return response.data;
};
export const fetchUserProfile = async (id: number) => {
  const response = await axiosInstance.get(
    API_ENDPOINT.PROFILE.VIEW_PROFILE(id),
  );
  return response.data.data || response.data;
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

export const updateUserDetails = async (
  id: number,
  data: UpdateProfileFormValues,
) => {
  const response = await axiosInstance.patch(
    API_ENDPOINT.PROFILE.UPDATE(id),
    data,
  );
  return response.data;
};

export const registerStaff = async (data: StaffRegisterFormValues) => {
  const response = await axiosInstance.post(API_ENDPOINT.STAFF.REGISTER, data);
  return response.data;
};

export const fetchStaffProfile = async (userId: number) => {
  const response = await axiosInstance.get(`/staff-profile/${userId}`);
  return response.data.data;
};
export const fetchProfessorHistory = async (userId: number) => {
  const response = await axiosInstance.get(
    `/professor-subject/history/${userId}`,
  );
  return response.data.data;
};
