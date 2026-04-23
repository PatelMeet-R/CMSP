import { ROUTENAME } from "@/core/Constants/RouteName";
import { toastService } from "@/core/toast/toastService";
import axios from "axios";
import Cookies from "js-cookie";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // REQUIRED FOR COOKIE
  headers: {
    "Content-Type": "application/json",
  },
});

// -------------------------------------
//  REQUEST INTERCEPTOR (Attach Tokens)
// -------------------------------------
axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// -------------------------------------
//  RESPONSE INTERCEPTOR
// -------------------------------------
axiosInstance.interceptors.response.use(
  (response) => response, // Pass through successful responses

  async (error) => {
    // A. Handle Server Down / Network Error completely
    if (!error.response) {
      toastService.error("Server not reachable");
      return Promise.reject(error);
    }

    const originalRequest = error.config;
    const status = error.response.status;
    const message = error.response.data?.message || "Something went wrong";

    // B. Handle 401 Unauthorized (Silent Refresh Logic)
    if (status === 401 && !originalRequest._retry) {
      // Infinite Loop Protection
      if (originalRequest.url.includes("/refresh")) {
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        toastService.error("Session expired. Please login again.");
        window.location.href = ROUTENAME.LOGIN;
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      const refreshToken = Cookies.get("refreshToken");

      if (refreshToken) {
        try {
          // Dynamic URL for production safety!
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/auth/refresh`,
            { refreshToken: refreshToken },
          );

          const { accessToken, refreshToken: newRefreshToken } =
            response.data.data;

          Cookies.set("accessToken", accessToken);
          if (newRefreshToken) Cookies.set("refreshToken", newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // Refresh failed (token dead/tampered)
          Cookies.remove("accessToken");
          Cookies.remove("refreshToken");
          sessionStorage.clear();

          toastService.error("Session expired. Please login again.");
          window.location.href = ROUTENAME.LOGIN;
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token available at all
        Cookies.remove("accessToken");
        sessionStorage.clear();
        toastService.error("Session expired. Please login again.");
        window.location.href = ROUTENAME.LOGIN;
        return Promise.reject(error);
      }
    }

    // C. Handle Global Toasts for all OTHER errors (403, 500, 400, etc.)
    // We skip 401 here because the block above already handled it!
    if (status !== 401) {
      if (status === 403) {
        toastService.error("Access denied");
      } else if (status === 500) {
        toastService.error("Server error");
      } else {
        toastService.error(message);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
