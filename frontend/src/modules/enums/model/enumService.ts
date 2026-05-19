import axiosInstance from "@/core/api/axiosInstance";
import type {
  CreateEnumPayload,
  EnumCategory,
  EnumValueResponse,
  UpdateEnumPayload,
} from "../types/enum.schemas";

export const enumService = {
  getEnumsByCategory: async (
    category: EnumCategory,
  ): Promise<EnumValueResponse[]> => {
    const response = await axiosInstance.get(`enums/${category}`);
    return response.data;
  },

  createEnum: async (category: EnumCategory, payload: CreateEnumPayload) => {
    const response = await axiosInstance.post(`enums/${category}`, payload);
    return response.data;
  },

  updateEnum: async (id: string, payload: UpdateEnumPayload) => {
    const response = await axiosInstance.patch(`enums/${id}`, payload);
    return response.data;
  },
};
