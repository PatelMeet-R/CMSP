import { ROUTENAME } from "@/core/Constants/RouteName";
import { useAppSelector } from "@/store/hook";
import { Navigate, Outlet, useLocation } from "react-router-dom";

// =============================================
//  Guest Guard — Redirects authenticated users away from public pages
//  Prevents logged-in users from seeing /login, /signin, etc.
// =============================================

export default function GuestGuard() {
  const { isAuthenticated, isHydrating } = useAppSelector(
    (state) => state.auth,
  );
  const location = useLocation();

  // Wait for hydration before deciding
  if (isHydrating) {
    return null;
  }

  if (isAuthenticated) {
    // If user came from a protected page, send them back
    const from = (location.state as { from?: Location })?.from?.pathname;
    return <Navigate to={from || ROUTENAME.DASHBOARD} replace />;
  }

  return <Outlet />;
}
