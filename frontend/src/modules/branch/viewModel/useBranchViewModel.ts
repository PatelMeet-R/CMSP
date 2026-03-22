import { getBranches } from "@/modules/branch/model/branch";
import { useQuery } from "@tanstack/react-query";

export function useBranchViewModel() {
  const {
    data: branches = [], // Default to an empty
    isLoading,
    error,
  } = useQuery({
    queryKey: ["branches"], //  cache specific data
    queryFn: getBranches, // Axios service function
  });

  return { branches, isLoading, error };
}
