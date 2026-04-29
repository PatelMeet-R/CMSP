import axiosInstance from "@/core/api/axiosInstance";
import { API_ENDPOINT } from "@/core/api/endPoint";
import type {
  BulkManagePermissionPayload,
  PermissionMatrixResponse,
} from "@/modules/users/types/permission.interface";
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
export const fetchUserProfile = async (id: string) => {
  const response = await axiosInstance.get(
    API_ENDPOINT.PROFILE.VIEW_PROFILE(id),
  );
  return response.data.data || response.data;
};

export const updateAccountStatus = async (id: string, statusKey: string) => {
  return await axiosInstance.patch(API_ENDPOINT.PROFILE.STATUS_UPDATE(id), {
    statusKey,
  });
};

export const updateUserRole = async (id: string, newRoleId: string) => {
  return await axiosInstance.patch(API_ENDPOINT.PROFILE.ROLE_UPDATE(id), {
    newRoleId,
  });
};

export const updateUserDetails = async (
  id: string,
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

export const fetchStaffProfile = async (userId: string) => {
  const response = await axiosInstance.get(API_ENDPOINT.STAFF.VIEW(userId));
  return response.data.data;
};
export const fetchProfessorHistory = async (userId: string) => {
  const response = await axiosInstance.get(
    API_ENDPOINT.STAFF.SUBJECT_HISTORY(userId),
  );
  return response.data.data;
};

// =============================================
//  V2: Permission Matrix API
// =============================================

/**
 * Fetch the two-tier permission matrix for a user.
 * Section 1: Base role permissions (can be revoked)
 * Section 2: Extra assignable permissions (can be granted)
 */
export const fetchPermissionMatrix = async (
  personalInfoId: string,
): Promise<PermissionMatrixResponse> => {
  const response = await axiosInstance.get(
    API_ENDPOINT.PERMISSION.GET_USER(personalInfoId),
  );
  return response.data.data;
};

// Save bulk permission overrides for a user.

export const savePermissionOverrides = async (
  personalInfoId: string,
  payload: BulkManagePermissionPayload,
) => {
  const response = await axiosInstance.put(
    API_ENDPOINT.PERMISSION.SAVE_USER(personalInfoId),
    payload,
  );
  return response.data;
};
