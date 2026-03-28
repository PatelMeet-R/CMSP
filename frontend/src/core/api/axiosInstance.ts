import { ROUTENAME } from "@/core/Constants/RouteName";
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

//Silent Refresh
axiosInstance.interceptors.response.use(
  (response) => response, // If the request succeeds, just return the data!

  async (error) => {
    // Grab the original request that just failed
    const originalRequest = error.config;

    // If the error is 401 (Unauthorized) AND we haven't tried to retry yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Infinite Loop Protection: If the refresh route ITSELF fails, do not try to refresh again!
      if (originalRequest.url.includes("/refresh")) {
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        // We use window.location because we are outside of React Router here!
        window.location.href = ROUTENAME.LOGIN;
        return Promise.reject(error);
      }

      // Mark this request so we don't get stuck in an infinite loop
      originalRequest._retry = true;

      const refreshToken = Cookies.get("refreshToken");

      if (refreshToken) {
        try {
          // A. Call your NestJS refresh endpoint
          // Note: We use a raw axios call here, NOT our 'api' instance, to avoid interceptor loops
          const response = await axios.post(
            "http://localhost:3000/auth/refresh",
            {
              refreshToken: refreshToken,
            },
          );

          // B. Extract the new tokens from your NestJS response structure
          // Based on our backend code, it returns { message: '...', data: { accessToken, refreshToken } }
          const { accessToken, refreshToken: newRefreshToken } =
            response.data.data;

          // C. Save the new tokens to your browser cookies
          Cookies.set("accessToken", accessToken);
          if (newRefreshToken) Cookies.set("refreshToken", newRefreshToken); 

          // D. Update the failed request with the brand new Access Token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          // E. RETRY THE ORIGINAL REQUEST!
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // If the refresh token is expired or invalid, destroy everything and force login
          Cookies.remove("accessToken");
          Cookies.remove("refreshToken");

          // Clear session storage so Redux forgets the user
          sessionStorage.clear();

          window.location.href = ROUTENAME.LOGIN;
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token found? Force logout.
        Cookies.remove("accessToken");
        sessionStorage.clear();
        window.location.href = ROUTENAME.LOGIN;
      }
    }

    // If it's any other error (500, 404, 400), just pass it down to the React component
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

    if (status === 402) {
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
