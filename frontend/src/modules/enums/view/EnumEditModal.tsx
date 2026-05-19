import { Save, Edit2, Tag, Type, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldLabel } from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { useEnumManagementViewModel } from "../viewModel/useEnumManagementViewModel";

interface EnumEditModalProps {
  vm: ReturnType<typeof useEnumManagementViewModel>;
}

export function EnumEditModal({ vm }: EnumEditModalProps) {
  // Hook the form submission safely to the VM's update handler
  const onEditSubmit = vm.form.handleSubmit((data) => {
    if (vm.enumToEdit) vm.handleUpdateSubmit(vm.enumToEdit.id, data);
  });

  return (
    <Dialog
      open={!!vm.enumToEdit}
      onOpenChange={(open) => !open && vm.closeModals()}
    >
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl">
        {/* Gradient bar */}
        <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300" />

        <DialogHeader className="px-6 pt-5 pb-4 border-b bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center shrink-0">
              <Edit2 className="w-4.5 h-4.5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                Edit System Value
              </DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                Update the details for this system constant.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-5">
          <div className="space-y-2">
            <FieldLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Tag className="h-3 w-3" />
              System Key (Internal) <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              {...vm.form.register("key")}
              className={`bg-background font-mono transition-all duration-150 focus-visible:ring-2 focus-visible:ring-ring/30 ${vm.form.formState.errors.key ? "border-destructive" : ""}`}
            />
            {vm.form.formState.errors.key && (
              <p className="text-xs text-destructive font-medium">
                {vm.form.formState.errors.key.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <FieldLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Type className="h-3 w-3" />
              Display Value (UI) <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              {...vm.form.register("value")}
              className={`bg-background transition-all duration-150 focus-visible:ring-2 focus-visible:ring-ring/30 ${vm.form.formState.errors.value ? "border-destructive" : ""}`}
            />
            {vm.form.formState.errors.value && (
              <p className="text-xs text-destructive font-medium">
                {vm.form.formState.errors.value.message}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-muted/10 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={vm.closeModals}
            disabled={vm.isSubmitting}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onEditSubmit}
            disabled={vm.isSubmitting || !vm.form.formState.isDirty}
            className="gap-1.5"
          >
            {vm.isSubmitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            {vm.isSubmitting ? "Updating…" : "Update Value"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
