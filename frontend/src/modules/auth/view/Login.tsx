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
import { useLoginViewModel } from "@/modules/auth/viewModel/useLoginViewModel";
import { Link } from "react-router-dom";
import { ROUTENAME } from "@/core/Constants/RouteName";

const Login = () => {
  const { form, onSubmit, isSubmitting } = useLoginViewModel();
  return (
    <div className="flex justify-center items-center h-screen w-screen">
      <div className="max-w-md mx-auto p-6 border rounded-lg shadow-sm">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldSet>
            <FieldLegend> Welcome Back</FieldLegend>
            <FieldDescription>
              Enter your credentials below to login to your account
            </FieldDescription>
            <FieldGroup className="space-y-5">
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      {...field}
                      id="email"
                      className="h-11"
                      type="email"
                      placeholder="abc@gmail.com"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]}></FieldError>
                    )}
                  </Field>
                )}
              />

              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <div className="flex justify-between items-center">
                      <FieldLabel>Password</FieldLabel>
                      <Link to={ROUTENAME.FORGET_PASSWORD} className="text-xs">
                        Forgot?
                      </Link>
                    </div>
                    <Input
                      {...field}
                      type="password"
                      className="h-11"
                      placeholder="******"
                    />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </FieldSet>
          <Field orientation={"responsive"}>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "loggin in..." : "Login"}
            </Button>
          </Field>
          <div className="text-center text-sm">
            Don’t have an account?
            <Link
              to={ROUTENAME.SIGNIN}
              className="text-primary hover:underline"
            >
              &ensp; Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
