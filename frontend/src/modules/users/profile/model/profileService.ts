import axiosInstance from "@/core/api/axiosInstance";
import { API_ENDPOINT } from "@/core/api/endPoint";
import type { ProfileResponse } from "@/modules/users/types/users.schemas";

export const getProfile = async (): Promise<ProfileResponse> => {
  const res = await axiosInstance.get(API_ENDPOINT.PROFILE.MY_PROFILE);
  return res.data.data;
};

interface FileUploadResponse {
  data: { id: number; url: string };
}

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
export const updateProfileImage = async (
  personalInfoId: number,
  profileImageId: number | null,
) => {
  const response = await axiosInstance.patch(
    API_ENDPOINT.PROFILE.AVATAR_UPDATE(personalInfoId),
    {
      profileImageId,
    },
  );
  return response.data;
};
