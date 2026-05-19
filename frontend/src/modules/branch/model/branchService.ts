import axiosInstance from "@/core/api/axiosInstance";
import { API_ENDPOINT } from "@/core/api/endPoint";
import type {
  Branch,
  CreateBranchPayload,
  UpdateBranchPayload,
} from "@/modules/branch/types/branch.schemas";

// 1. Fetch All Branches
export const getBranches = async (): Promise<Branch[]> => {
  const response = await axiosInstance.get(API_ENDPOINT.BRANCH.VIEW);
  return response.data.data;
};

// 2. Create Branch
export const createBranch = async (payload: CreateBranchPayload) => {
  const response = await axiosInstance.post(
    API_ENDPOINT.BRANCH.REGISTER,
    payload,
  );
  return response.data;
};

// 3. Update Branch
export const updateBranch = async (
  branchId: string,
  payload: UpdateBranchPayload,
) => {
  const response = await axiosInstance.patch(
    API_ENDPOINT.BRANCH.UPDATE(branchId),
    payload,
  );
  return response.data;
};
