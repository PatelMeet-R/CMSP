import axiosInstance from "@/core/api/axiosInstance";
import type { DashboardMetricsResponse } from "../types/dashboard.interface";

export const fetchDashboardMetrics =
  async (): Promise<DashboardMetricsResponse> => {
    const response = await axiosInstance.get("/dashboard/metrics");
    return response.data.data;
  };
