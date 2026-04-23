import { Controller, type Path, type UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FieldLabel } from "@/components/ui/field";
import type { UpdateProfileFormValues } from "@/modules/users/types/users.schemas";

export interface ProfileRenderFieldProps {
  name: Path<UpdateProfileFormValues>;
  label: string;
  isRestricted?: boolean;
  form: UseFormReturn<UpdateProfileFormValues>;
  isEditing: boolean;
  isAdmin: boolean;
}

export const ProfileRenderField = ({
  name,
  label,
  isRestricted = false,
  form,
  isEditing,
  isAdmin,
}: ProfileRenderFieldProps) => {
  const value = form.watch(name);

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel className="text-muted-foreground">{label}</FieldLabel>

      {!isEditing && (
        <div className="h-10 py-2 text-sm font-medium border-b border-transparent">
          {value || "N/A"}
        </div>
      )}

      {isEditing && (
        <Controller
          name={name}
          control={form.control}
          render={({ field }) => (
            <Input
              {...field}
              value={field.value || ""} // Prevent undefined warnings
              disabled={isRestricted && !isAdmin}
              className={`h-10 ${isRestricted && !isAdmin ? "bg-muted cursor-not-allowed" : ""}`}
            />
          )}
        />
      )}
    </div>
  );
};
