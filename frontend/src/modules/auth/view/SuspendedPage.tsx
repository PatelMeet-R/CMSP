import { STATUS } from "@/core/Constants/enums/status.enum.values";
import { ROUTENAME } from "@/core/Constants/RouteName";
import { logoutUser } from "@/modules/auth/model/authService";
import { useRequestVarification } from "@/modules/users/profile/viewModel/useRequestVarification";
import { logout } from "@/store/features/auth.slice";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { Ban, Loader2, Mail, PauseCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

// =============================================
//  Account Suspended Page
//  Shown when StatusGuard blocks a user (INACTIVE / BLOCKED / REJECTED)
// =============================================

export default function SuspendedPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const { mutate, isSuccess, isPending } = useRequestVarification();

  const statusMessages: Record<
    string,
    {
      title: string;
      description: string;
      icon: React.ElementType;
      color?: string;
    }
  > = {
    INACTIVE: {
      title: "Account Inactive",
      description:
        "Your account has been marked as inactive due to prolonged absence. Please contact the administration to reactivate your account.",
      icon: PauseCircle,
      color: "text-amber-500",
    },
    BLOCKED: {
      title: "Account Suspended",
      description:
        "Your account has been suspended. Please contact the administration for more information.",
      icon: Ban,
      color: "text-red-500",
    },
    REJECTED: {
      title: "Account Rejected",
      description:
        "Your registration has been rejected by an administrator. If you believe this is a mistake, please contact support.",
      icon: XCircle,
      color: "text-red-600",
    },
  };

  const status = user?.status || STATUS.BLOCKED || "BLOCKED";
  const info = statusMessages[status] || statusMessages.BLOCKED;
  const StatusIcon = info.icon;

  const handleLogout = async () => {
    await logoutUser();
    dispatch(logout());
    navigate(ROUTENAME.LOGIN);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="mx-auto max-w-md text-center">
        <div className={`mb-6 text-6xl ${info.color}`}>
          <StatusIcon className="h-20 w-20 stroke-[1.5]" />
        </div>
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-foreground">
          {info.title}
        </h1>
        <p className="mb-8 text-muted-foreground leading-relaxed">
          {info.description}
        </p>

        {user?.email && (
          <p className="mb-6 text-sm text-muted-foreground">
            Logged in as:{" "}
            <span className="font-medium text-foreground">{user.email}</span>
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          {status === STATUS.INACTIVE && (
            <button
              onClick={() => mutate()}
              disabled={isPending}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              {isSuccess
                ? "Email Sent! Check Inbox"
                : "Resend Verification Email"}
            </button>
          )}
          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Sign Out
          </button>
          <div className="mt-8">
            <a
              href="mailto:meet333110@gmail.com"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-2.5 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Contact support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
