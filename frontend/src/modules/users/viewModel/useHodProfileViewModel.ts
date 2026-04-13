import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchUserProfile,
  fetchUsersList,
} from "@/modules/users/model/usersService";

interface UseHodProfileViewModelProps {
  branchId?: number;
  hodRoleId?: string;
}

export const useHodProfileViewModel = ({
  branchId,
  hodRoleId,
}: UseHodProfileViewModelProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const { data: listData, isLoading: isListLoading } = useQuery({
    queryKey: ["hod-list-search", branchId, hodRoleId],
    queryFn: () =>
      fetchUsersList({
        page: 1,
        branchId,
        roleId: Number(hodRoleId),
        limit: 1,
      }),
    enabled: isOpen && !!branchId && !!hodRoleId,
  });

  const targetHodId = listData?.items?.[0]?.id;

  const { data: hodDetails, isLoading: isDetailsLoading } = useQuery({
    queryKey: ["hod-details", targetHodId],
    queryFn: () => fetchUserProfile(targetHodId!),
    enabled: !!targetHodId,
  });

  const isLoading = isListLoading || isDetailsLoading;

  return {
    isOpen,
    setIsOpen,
    isLoading,
    hodDetails,
  };
};
