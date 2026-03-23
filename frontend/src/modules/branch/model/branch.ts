import axiosInstance from "@/core/api/axiosInstance";
import { API_ENDPOINT } from "@/core/api/endPoint";
import type { Branch } from "@/modules/branch/types/branch";

export const getBranches = async (): Promise<Branch[]> => {
  const response = await axiosInstance.get(API_ENDPOINT.BRANCH.VIEW); 
  return response.data.data;
};
