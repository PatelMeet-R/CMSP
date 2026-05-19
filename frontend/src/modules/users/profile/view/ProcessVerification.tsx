import { useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import { ROUTENAME } from "@/core/Constants/RouteName";
import { useProcessVerification } from "@/modules/users/profile/viewModel/useProcessVerification";

export const ProcessVerification = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const hasAttempted = useRef(false);

  const { mutate, isPending, isSuccess, isError, error } =
    useProcessVerification();

  useEffect(() => {
    if (token && !hasAttempted.current) {
      hasAttempted.current = true;
      mutate(token);
    }
  }, [token, mutate]);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <div className="w-full max-w-md text-center rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-rose-400 to-rose-300" />
          <div className="p-8">
            <div className="h-16 w-16 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center mx-auto mb-5">
              <XCircle className="w-8 h-8 text-rose-500" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Invalid Link
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              This verification link is missing or malformed.
            </p>
            <Button asChild variant="outline" className="mt-6 w-full gap-2">
              <Link to={ROUTENAME.LOGIN}>
                Back to Login
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md text-center rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
        {/* Gradient accent bar — changes color based on state */}
        <div
          className={`h-1.5 w-full bg-gradient-to-r ${
            isPending
              ? "from-primary via-primary/70 to-primary/40"
              : isSuccess
                ? "from-emerald-500 via-emerald-400 to-emerald-300"
                : "from-rose-500 via-rose-400 to-rose-300"
          }`}
        />

        <div className="p-8 sm:p-10">
          {/* Icon */}
          <div className="mx-auto mb-6">
            {isPending && (
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            )}
            {isSuccess && (
              <div className="h-16 w-16 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
            )}
            {isError && (
              <div className="h-16 w-16 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8 text-rose-500" />
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {isPending && "Verifying your email…"}
            {isSuccess && "Email Verified!"}
            {isError && "Verification Failed"}
          </h1>

          {/* Content */}
          <div className="mt-4">
            {isSuccess && (
              <div className="space-y-5">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Thank you for verifying your email. You can now log in to
                  access all features.
                </p>
                <Button asChild className="w-full gap-2">
                  <Link to={ROUTENAME.LOGIN}>
                    Go to Login
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
            {isError && (
              <div className="space-y-5">
                <p className="text-sm text-destructive/80 leading-relaxed">
                  {(error as any)?.response?.data?.message ||
                    "The link may be expired or invalid."}
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="w-full gap-2"
                >
                  <Link to={ROUTENAME.LOGIN}>
                    Back to Login
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
