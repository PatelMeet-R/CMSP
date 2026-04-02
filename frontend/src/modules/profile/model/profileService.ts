import axiosInstance from "@/core/api/axiosInstance";
import { API_ENDPOINT } from "@/core/api/endPoint";
import type {
  ProfileResponse,
  UpdateProfileFormValues,
} from "@/modules/profile/types/profile.schema";

export const getProfile = async (): Promise<ProfileResponse> => {
  const res = await axiosInstance.get(API_ENDPOINT.PROFILE.MY_PROFILE);
  return res.data.data;
};

export const updateProfile = async (
  profileId: number,
  data: UpdateProfileFormValues,
): Promise<ProfileResponse> => {
  const res = await axiosInstance.patch(
    API_ENDPOINT.PROFILE.UPDATE(profileId),
    data,
  );

  return res.data.data;
};
