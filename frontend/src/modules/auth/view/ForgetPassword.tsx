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
import { Link } from "react-router-dom";
import { useForgotPasswordViewModel } from "@/modules/auth/viewModel/useForgotPasswordViewModel";

const ForgetPassword = () => {
  const { form, onSubmit, isSubmitting } = useForgotPasswordViewModel();

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md bg-background border rounded-xl shadow-md p-6 sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold">Forgot Password</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email to receive reset instructions
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FieldSet>
            <FieldLegend>Reset Password</FieldLegend>
            <FieldDescription>
              We will send a reset link to your email
            </FieldDescription>

            <FieldGroup>
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Email</FieldLabel>
                    <Input
                      {...field}
                      type="email"
                      className="h-11"
                      placeholder="abc@gmail.com"
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
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </Button>

          <div className="text-center text-sm">
            Remember your password?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgetPassword;
