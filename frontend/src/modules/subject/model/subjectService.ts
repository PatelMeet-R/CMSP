import axiosInstance from "@/core/api/axiosInstance";
import { API_ENDPOINT } from "@/core/api/endPoint";
import type {
  CreateSubjectPayload,
  UpdateSubjectPayload,
} from "@/modules/subject/types/subject.schemas";

export const fetchSubjects = async (params: {
  page: number;
  limit: number;
  search?: string;
  branchId?: string;
  semesterId?: string;
}) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINT.SUBJECT.VIEW, {
      params,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const getSubjectDetails = async (subjectId: string) => {
  const response = await axiosInstance.get(
    API_ENDPOINT.SUBJECT.VIEW_BY_ID(subjectId),
  );

  return response.data.data;
};
export const updateSubjectDetails = async (
  subjectId: string,
  data: UpdateSubjectPayload,
) => {
  const response = await axiosInstance.patch(
    API_ENDPOINT.SUBJECT.UPDATE(subjectId),
    data,
  );
  return response.data;
};
export const createSubjectDetails = async (data: CreateSubjectPayload) => {
  const response = await axiosInstance.post(
    API_ENDPOINT.SUBJECT.REGISTER,
    data,
  );
  return response.data.data;
};
