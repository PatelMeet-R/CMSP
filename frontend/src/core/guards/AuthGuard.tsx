import { ROUTENAME } from "@/core/Constants/RouteName";
import { USER_STATUS, type UserStatus } from "@/modules/auth/types/auth.schemas";
import { useAppSelector } from "@/store/hook";
import { Navigate, Outlet, useLocation } from "react-router-dom";

// =============================================
//  V2 Auth Guard — No Flicker, Status-Aware
//
//  Responsibility:
//  1. Blocks unauthenticated users → /login
//  2. Blocks INACTIVE/BLOCKED/REJECTED users → /account/suspended
//  3. Shows a loading state during hydration (prevents flicker)
//  4. Passes through for ACTIVE/PENDING users
// =============================================

/** Statuses that are completely blocked from the app */
const BLOCKED_STATUSES: UserStatus[] = [
  USER_STATUS.BLOCKED,
  USER_STATUS.REJECTED,
  USER_STATUS.INACTIVE,
];

/**
 * Loading spinner shown during auth hydration.
 * Prevents the "flash of login page" on refresh.
 */
function HydrationLoader() {
  return (
    <div className="flex items-center justify-center h-screen w-screen bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading your session...</p>
      </div>
    </div>
  );
}

export default function AuthGuard() {
  const { isAuthenticated, isHydrating, user } = useAppSelector(
    (state) => state.auth,
  );
  const location = useLocation();

  // -----------------------------------------------
  //  Phase 1: Hydration — wait for persisted state
  //  Without this, refreshing the page causes a
  //  momentary redirect to /login before Redux
  //  rehydrates from sessionStorage.
  // -----------------------------------------------
  if (isHydrating) {
    return <HydrationLoader />;
  }

  // -----------------------------------------------
  //  Phase 2: Authentication check
  // -----------------------------------------------
  if (!isAuthenticated || !user) {
    // Save the attempted URL so we can redirect back after login
    return <Navigate to={ROUTENAME.LOGIN} state={{ from: location }} replace />;
  }

  // -----------------------------------------------
  //  Phase 3: Account status check
  //  Even if the user has a valid session, their
  //  account may have been suspended since login.
  // -----------------------------------------------
  if (user.status && BLOCKED_STATUSES.includes(user.status as UserStatus)) {
    return <Navigate to={ROUTENAME.SUSPENDED} replace />;
  }

  // -----------------------------------------------
  //  Phase 4: All checks passed — render children
  // -----------------------------------------------
  return <Outlet />;
}
