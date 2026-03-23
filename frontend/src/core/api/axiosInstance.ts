import { toastService } from "@/core/toast/toastService";
import axios from "axios";
import Cookies from "js-cookie";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, //  REQUIRED FOR COOKIE
  headers: {
    "Content-Type": "application/json",
  },
});
axiosInstance.interceptors.request.use(
  (config) => {
    // Grab the token from the cookie
    const token = Cookies.get("accessToken");

    // If the token exists, attach it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config; // Let the request continue
  },
  (error) => {
    return Promise.reject(error);
  },
);
//  Global response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,

  (error) => {
    if (!error.response) {
      toastService.error("Server not reachable");
      return Promise.reject(error);
    }

    const status = error.response.status;
    const message = error.response.data?.message || "Something went wrong";

    if (status === 401) {
      toastService.error("Session expired. Please login again");

      // optional redirect
      window.location.href = "/servererror";
    } else if (status === 403) {
      toastService.error("Access denied");
    } else if (status === 500) {
      toastService.error("Server error");
    } else {
      toastService.error(message);
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
