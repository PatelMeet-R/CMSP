import { useSignupViewModel } from "../viewModel/useSignupViewModel";
import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
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

import { Link } from "react-router-dom";
import { ROUTENAME } from "@/core/Constants/RouteName";
import { BranchDropdownMenu } from "@/modules/branch/view/BranchDropdownMenu";

const Signup = () => {
  const { form, onSubmit, isSubmitting } = useSignupViewModel();

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="w-full max-w-lg bg-background border rounded-xl shadow-md p-6 sm:p-8">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FieldSet>
            <FieldLegend> Create Account</FieldLegend>
            <FieldDescription>
              Enter Your Details to Register an Account
            </FieldDescription>

            {/* (First Name) */}
            <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="firstName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                    <Input
                      {...field}
                      id="firstName"
                      type="text"
                      className="h-11"
                      placeholder="Enter Your First Name"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              {/* (Last Name) */}
              <Controller
                name="lastName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                    <Input
                      {...field}
                      id="lastName"
                      className="h-11"
                      type="text"
                      placeholder="Enter Your Last Name"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              {/* (Enrollment Number) */}
              <Controller
                name="enrollmentNumber"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="md:col-span-2"
                  >
                    <FieldLabel htmlFor="enrollmentNumber">
                      Enrollment Number
                    </FieldLabel>
                    <Input
                      {...field}
                      id="enrollmentNumber"
                      type="number"
                      className="h-11"
                      placeholder="Enter Your Entrollment Number"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              {/* Email  */}
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="md:col-span-2"
                  >
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      {...field}
                      id="email"
                      type="email"
                      className="h-11"
                      placeholder="abc@gmail.com"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]}></FieldError>
                    )}
                  </Field>
                )}
              />

              {/* --- THE BRANCH DROPDOWN --- */}
              {/* exact name of the field  */}
              <BranchDropdownMenu control={form.control} name="branchId" />

              {/* Password Input  */}
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                      {...field}
                      id="password"
                      // className="h-11"
                      type="password"
                      placeholder="******"
                      aria-invalid={fieldState.invalid}
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
            <Button
              type="submit"
              className="w-full h-11 text-base font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "Sign Up"}
            </Button>
          </Field>
          <div className="flex justify-between items-center text-sm">
            <Link
              to={ROUTENAME.FORGET_PASSWORD}
              className="text-primary hover:underline"
            >
              Forgot Password?
            </Link>

            <Link to={ROUTENAME.LOGIN} className="text-primary hover:underline">
              Already have an account?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
