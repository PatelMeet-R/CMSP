import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { useEnumViewModel } from "@/modules/enums/viewModel/useEnumViewModel";
import type { EnumCategory } from "@/modules/enums/types/enum.schemas";

interface EnumDropdownMenuProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  category: EnumCategory;
  disabled?: boolean;
}

export const EnumDropdownMenu = <T extends FieldValues>({
  control,
  name,
  label,
  category,
  disabled = false,
}: EnumDropdownMenuProps<T>) => {
  const { enums, isLoading } = useEnumViewModel(category);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel>{label}</FieldLabel>
          <Select
            onValueChange={(value) => {
              // field.onChange(value);
              field.onChange(value);
            }}
            value={field.value ? field.value.toString() : ""}
            disabled={isLoading || disabled}
          >
            <SelectTrigger className="h-10 text-sm px-3">
              <SelectValue
                className="text-sm"
                placeholder={
                  isLoading ? "Loading..." : `Select ${label.toLowerCase()}`
                }
              />
            </SelectTrigger>
            <SelectContent>
              {enums?.map((enumItem: any) => {
                if (!enumItem.id) return null;
                return (
                  <SelectItem key={enumItem.id} value={enumItem.id.toString()}>
                    {enumItem.value}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {fieldState.error && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};
