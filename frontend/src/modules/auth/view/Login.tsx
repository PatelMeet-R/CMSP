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

const Login = () => {
  const { form, onSubmit } = useLoginViewModel();
  return (
    <div>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FieldSet>
          <FieldLegend> Login</FieldLegend>
          <FieldDescription>
            Enter your email below to login to your account
          </FieldDescription>
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    {...field}
                    id="email"
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
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    {...field}
                    id="password"
                    type="password"
                    placeholder="******"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]}></FieldError>
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>
        <Field orientation={"responsive"}>
          <Button type="submit" className="bg-blue-400">
            Login
          </Button>
        </Field>
      </form>
    </div>
  );
};

export default Login;
