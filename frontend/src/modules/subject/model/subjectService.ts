import axiosInstance from "@/core/api/axiosInstance";
import { API_ENDPOINT } from "@/core/api/endPoint";

export const fetchSubjects = async (params: {
  page: number;
  limit: number;
  search?: string;
  branchId?: number;
  semesterId?: number;
}) => {
  console.log(
    "📡 [API LAYER] Sending Request to /subject with params:",
    params,
  );
  try {
    const response = await axiosInstance.get(API_ENDPOINT.SUBJECT.VIEW, {
      params,
    });
    console.log("✅ [API LAYER] Success! Raw Backend Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ [API LAYER] Fetch Failed:", error);
    throw error;
  }
};
