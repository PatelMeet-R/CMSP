import axiosInstance from "@/core/api/axiosInstance";
import { API_ENDPOINT } from "@/core/api/endPoint";
import type { ProfileResponse } from "@/modules/users/types/users.schemas";

interface FileUploadResponse {
  data: { id: string; url: string };
}
// ============================
export const getProfile = async (): Promise<ProfileResponse> => {
  const res = await axiosInstance.get(API_ENDPOINT.PROFILE.MY_PROFILE);
  return res.data.data;
};
// ============================

export const uploadFile = async (
  file: File,
  folder: string,
): Promise<FileUploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);
  const response = await axiosInstance.post(
    API_ENDPOINT.PROFILE.AVATAR_UPLOAD,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return response.data;
};
// ============================

export const updateProfileImage = async (
  personalInfoId: string,
  profileImageId: string | null,
) => {
  const response = await axiosInstance.patch(
    API_ENDPOINT.PROFILE.AVATAR_UPDATE(personalInfoId),
    {
      profileImageId,
    },
  );
  return response.data;
};
// ============================

export const fetchUserById = async (userId: string) => {
  // Replace with your actual user fetch endpoint
  const response = await axiosInstance.get(`/auth/users/${userId}`);
  return response.data.data;
};

