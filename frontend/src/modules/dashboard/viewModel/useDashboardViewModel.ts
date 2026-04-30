import { useQuery } from "@tanstack/react-query";
import { fetchDashboardMetrics } from "../model/dashboardService";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

export const useDashboardViewModel = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const {
    data: metrics,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["dashboard-metrics", user?.id],
    queryFn: fetchDashboardMetrics,
    enabled: !!user, // Only fetch if the user is logged in
  });

  return {
    user,
    metrics,
    isLoading,
    isError,
    roleType: metrics?.type || user?.role || "UNKNOWN",
  };
};
