import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Link, useSearchParams } from "react-router-dom";
import { useResetPasswordViewModel } from "@/modules/auth/viewModel/useResetPasswordViewModel";

const ResetPassword = () => {
  const { form, onSubmit, isSubmitting } = useResetPasswordViewModel();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md bg-background border rounded-xl shadow-md p-6 sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold">Reset Password</h1>
          <p className="text-sm text-muted-foreground">
            Enter your new password below
          </p>
        </div>
        <form
          onSubmit={form.handleSubmit((data) =>
            onSubmit({
              token: token || "",
              data,
            }),
          )}
          className="space-y-5"
        >
          <FieldSet>
            <FieldLegend>New Password</FieldLegend>
            <FieldDescription>
              Your new password must be at least 6 characters
            </FieldDescription>

            <FieldGroup className="space-y-4">
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Password</FieldLabel>
                    <Input
                      {...field}
                      type="password"
                      className="h-11"
                      placeholder="Enter new password"
                    />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="confirmPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Confirm Password</FieldLabel>
                    <Input
                      {...field}
                      type="password"
                      className="h-11"
                      placeholder="Confirm password"
                    />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </FieldSet>

          <Button
            type="submit"
            className="w-full h-11 text-base font-medium"
            disabled={isSubmitting || !token}
          >
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </Button>

          <div className="text-center text-sm">
            <Link to="/login" className="text-primary hover:underline">
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
