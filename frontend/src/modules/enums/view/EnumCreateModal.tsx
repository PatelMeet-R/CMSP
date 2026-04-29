import { Save, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldLabel } from "@/components/ui/field";
import { SpinnerCustom } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { useEnumManagementViewModel } from "../viewModel/useEnumManagementViewModel";

interface EnumCreateModalProps {
  vm: ReturnType<typeof useEnumManagementViewModel>;
}

export function EnumCreateModal({ vm }: EnumCreateModalProps) {
  return (
    <Dialog
      open={vm.isCreateModalOpen}
      onOpenChange={(open) => !open && vm.closeModals()}
    >
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-primary" />
            Add System Value
          </DialogTitle>
          <DialogDescription>
            Add a new constant to the{" "}
            <span className="font-bold text-foreground">
              {vm.activeCategory}
            </span>{" "}
            category.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <FieldLabel className="text-xs font-bold text-muted-foreground uppercase">
              System Key (Internal) *
            </FieldLabel>
            <Input
              placeholder="e.g., FALL_2026"
              {...vm.form.register("key")}
              className={vm.form.formState.errors.key ? "border-red-500" : ""}
            />
            {vm.form.formState.errors.key && (
              <p className="text-xs text-red-500">
                {vm.form.formState.errors.key.message}
              </p>
            )}
            <p className="text-[10px] text-muted-foreground mt-1">
              Used by the database. Spaces will be auto-converted to
              underscores.
            </p>
          </div>

          <div className="space-y-2">
            <FieldLabel className="text-xs font-bold text-muted-foreground uppercase">
              Display Value (UI) *
            </FieldLabel>
            <Input
              placeholder="e.g., Fall Semester 2026"
              {...vm.form.register("value")}
              className={vm.form.formState.errors.value ? "border-red-500" : ""}
            />
            {vm.form.formState.errors.value && (
              <p className="text-xs text-red-500">
                {vm.form.formState.errors.value.message}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={vm.closeModals}
            disabled={vm.isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={vm.handleCreateSubmit}
            disabled={vm.isSubmitting || !vm.form.formState.isValid}
          >
            {vm.isSubmitting ? (
              <>
                <SpinnerCustom /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> Save Value
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
