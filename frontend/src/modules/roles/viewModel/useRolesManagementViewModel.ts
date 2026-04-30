import { useQuery } from "@tanstack/react-query";
import { usePermissions } from "@/hooks/usePermissions";
import { fetchAllRoles } from "@/modules/roles/model/roleService";

export const useRolesManagementViewModel = () => {
  const { hasPermission } = usePermissions();

  const canManageRoles =
    hasPermission("user:manage-role") || hasPermission("user:manage-global");

  const {
    data: roles = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["roles-list"],
    queryFn: fetchAllRoles,
    enabled: canManageRoles,
  });

  return {
    roles,
    isLoading,
    isError,
    canManageRoles,
  };
};
