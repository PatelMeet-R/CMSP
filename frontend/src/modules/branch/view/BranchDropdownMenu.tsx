import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBranchViewModel } from "@/modules/branch/viewModel/useBranchViewModel";

// 1. Import FieldValues and Path to make this dynamically typed!
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";

// 2. Add the Generic <T> to your interface
interface BranchDropdownMenuProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>; // This forces the name to match a real field in your form!
  label?: string;
}

// 3. Add the Generic <T> to your component definition
export const BranchDropdownMenu = <T extends FieldValues>({
  control,
  name,
  label = "Branch",
}: BranchDropdownMenuProps<T>) => {
  const { branches, isLoading: isLoadingBranches } = useBranchViewModel();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel>{label}</FieldLabel>
          <Select
            onValueChange={(value) => {
              field.onChange(parseInt(value, 10));
            }}
            value={field.value ? field.value.toString() : ""}
            disabled={isLoadingBranches}
          >
            <SelectTrigger className="h-11 text-sm px-3">
              <SelectValue
                className="text-sm"
                placeholder={
                  isLoadingBranches ? "Loading branches..." : "Select a branch"
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
  );
};
