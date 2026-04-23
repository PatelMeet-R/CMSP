import axiosInstance from "@/core/api/axiosInstance";
import { API_ENDPOINT } from "@/core/api/endPoint";

export const fetchSystemSetting = async (key: string) => {
  const response = await axiosInstance.get(API_ENDPOINT.SETTING.GET(key));
  return response.data.data;
};

export const upsertSystemSetting = async (data: {
  key: string;
  value: string;
  description?: string;
}) => {
  const response = await axiosInstance.patch(API_ENDPOINT.SETTING.UPSERT, data);
  return response.data;
};
