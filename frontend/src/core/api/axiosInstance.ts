import { ROUTENAME } from "@/core/Constants/RouteName";
import { toastService } from "@/core/toast/toastService";
import { store } from "@/store/store";
import { logout } from "@/store/features/auth.slice";
import axios from "axios";

// =============================================
//  V2 Axios Instance — HttpOnly Cookie Auth
//  NO js-cookie. Tokens are managed by the browser.
// =============================================

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Browser sends HttpOnly cookies automatically
  headers: {
    "Content-Type": "application/json",
  },
});

// =============================================
//  REQUEST INTERCEPTOR
//  No token injection needed — browser handles cookies.
// =============================================
axiosInstance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
);

// =============================================
//  STATUS GUARD ERROR CODES
//  Matches the backend StatusGuard error messages.
// =============================================
const STATUS_GUARD_ERRORS = {
  INACTIVE: "ACCOUNT_INACTIVE",
  SUSPENDED: "suspended or rejected",
} as const;

/**
 * Detects if a 403 error is from the StatusGuard (account state)
 * vs. a PermissionsGuard (insufficient permissions).
 */
function isStatusGuardError(message: string): {
  isStatusError: boolean;
  reason: "INACTIVE" | "SUSPENDED" | null;
} {
  if (message.includes(STATUS_GUARD_ERRORS.INACTIVE)) {
    return { isStatusError: true, reason: "INACTIVE" };
  }
  if (message.includes(STATUS_GUARD_ERRORS.SUSPENDED)) {
    return { isStatusError: true, reason: "SUSPENDED" };
  }
  return { isStatusError: false, reason: null };
}

// =============================================
//  RESPONSE INTERCEPTOR
// =============================================
axiosInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    // A. Network Error / Server Unreachable
    if (!error.response) {
      toastService.error("Server not reachable. Please check your connection.");
      return Promise.reject(error);
    }

    const originalRequest = error.config;
    const status = error.response.status;
    const message = error.response.data?.message || "Something went wrong";

    // -----------------------------------------------
    //  B. Handle 401 — Silent Token Refresh
    //  Cookies are HttpOnly, so the browser manages
    //  sending them. We just call /auth/refresh.
    // -----------------------------------------------
    if (status === 401 && !originalRequest._retry) {
      // Prevent infinite loop: if the refresh call itself fails, bail out.
      if (originalRequest.url?.includes("/auth/refresh")) {
        store.dispatch(logout());
        sessionStorage.clear();
        toastService.error("Session expired. Please login again.");
        window.location.href = ROUTENAME.LOGIN;
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        // The browser automatically sends the httpOnly refreshToken cookie
        // to this route (path-scoped to /auth/refresh on backend).
        await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        // Cookies are rotated server-side. Just retry the original request.
        return axiosInstance(originalRequest);
      } catch {
        // Refresh token is dead — force full re-login
        store.dispatch(logout());
        sessionStorage.clear();
        toastService.error("Session expired. Please login again.");
        window.location.href = ROUTENAME.LOGIN;
        return Promise.reject(error);
      }
    }

    // -----------------------------------------------
    //  C. Handle 403 — StatusGuard vs PermissionsGuard
    //  The StatusGuard returns specific message prefixes
    //  that we can parse to differentiate.
    // -----------------------------------------------
    if (status === 403) {
      const { isStatusError, reason } = isStatusGuardError(message);

      if (isStatusError) {
        // Account-level block — redirect, don't just toast.
        store.dispatch(logout());

        if (reason === "INACTIVE") {
          window.location.href = ROUTENAME.SUSPENDED;
        } else {
          // BLOCKED / REJECTED
          window.location.href = ROUTENAME.SUSPENDED;
        }
        return Promise.reject(error);
      }

      // Regular permission denial (PermissionsGuard)
      toastService.error("You do not have permission to perform this action.");
      return Promise.reject(error);
    }

    // -----------------------------------------------
    //  D. Handle all other errors (400, 404, 500, etc.)
    // -----------------------------------------------
    if (status === 500) {
      toastService.error("Internal server error. Please try again later.");
    } else if (status !== 401) {
      // 401 already handled above
      toastService.error(message);
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
