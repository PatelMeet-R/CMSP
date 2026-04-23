import { useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";
import { ROUTENAME } from "@/core/Constants/RouteName";
import { useProcessVerification } from "@/modules/users/profile/viewModel/useProcessVerification";
import { SpinnerCustom } from "@/components/ui/spinner";

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
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <Card className="w-full max-w-md text-center p-6">
          <CardTitle>Invalid Link</CardTitle>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md text-center py-8 shadow-lg border-0">
        <CardHeader>
          <div className="mx-auto mb-4">
            {isPending && <SpinnerCustom />}
            {isSuccess && (
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            )}
            {isError && <XCircle className="w-16 h-16 text-red-500 mx-auto" />}
          </div>
          <CardTitle className="text-2xl">
            {isPending && "Verifying your email..."}
            {isSuccess && "Email Verified!"}
            {isError && "Verification Failed"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mt-4">
            {isSuccess && (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Thank you for verifying your email. You can now log in to
                  access all features.
                </p>
                <Button asChild className="w-full">
                  <Link to={ROUTENAME.LOGIN}>Go to Login</Link>
                </Button>
              </div>
            )}
            {isError && (
              <div className="space-y-4">
                <p className="text-destructive text-sm">
                  {(error as any)?.response?.data?.message ||
                    "The link may be expired or invalid."}
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link to={ROUTENAME.LOGIN}>Back to Login</Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
