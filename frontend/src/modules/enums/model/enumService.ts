import axiosInstance from "@/core/api/axiosInstance";
import type { EnumCategory, EnumValueResponse } from "../types/enum.schemas";

export const enumService = {
  getEnumsByCategory: async (
    category: EnumCategory,
  ): Promise<EnumValueResponse[]> => {
    const response = await axiosInstance.get(`enums/${category}`);
    return response.data;
  },
};
