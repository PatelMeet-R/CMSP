import { useQuery } from "@tanstack/react-query";
import { enumService } from "../model/enumService";
import type { EnumCategory } from "../types/enum.schemas";

export const useEnumViewModel = (category: EnumCategory) => {
  const { data: enums = [], isLoading } = useQuery({
    queryKey: ["enums", category],
    queryFn: () => enumService.getEnumsByCategory(category),
    staleTime: 10000 * 60 * 60,
  });

  return {
    enums,
    isLoading,
  };
};
