import { useSignupViewModel } from "../viewModel/useSignupViewModel";
import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Signup = () => {
  const { form, onSubmit, branches, isLoadingBranches } = useSignupViewModel();

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-6">Create an Account</h2>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* (First Name) */}
        <Controller
          name="firstName"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="firstName">First Name</FieldLabel>
              <Input {...field} id="firstName" placeholder="John" />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* --- THE BRANCH DROPDOWN --- */}
        <Controller
          name="branchId"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Branch</FieldLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(parseInt(value, 10));
                }}
                value={field.value?.toString()}
                disabled={isLoadingBranches}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      isLoadingBranches
                        ? "Loading branches..."
                        : "Select a branch"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id.toString()}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Password Input  */}
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input {...field} id="password" type="password" placeholder="******" />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Button type="submit" className="w-full">
          Sign Up
        </Button>
      </form>
    </div>
  );
};

export default Signup;
