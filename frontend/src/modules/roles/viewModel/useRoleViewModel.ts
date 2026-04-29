import { useQuery } from "@tanstack/react-query";
import { fetchAllRoles } from "../model/roleService";

export const useRoleViewModel = () => {
  const {
    data: roles,
    isLoading: isRolesLoading,
    isError: isRolesError,
  } = useQuery({
    queryKey: ["roles"],
    queryFn: fetchAllRoles,
    staleTime: 5 * 60 * 1000, 
  });

  return {
    roles,
    isRolesLoading,
    isRolesError,
  };
};
