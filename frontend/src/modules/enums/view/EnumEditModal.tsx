import { Save, Edit2 } from "lucide-react";
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
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit2 className="w-5 h-5 text-primary" />
            Edit System Value
          </DialogTitle>
          <DialogDescription>
            Update the details for this system constant.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <FieldLabel className="text-xs font-bold text-muted-foreground uppercase">
              System Key (Internal) *
            </FieldLabel>
            <Input {...vm.form.register("key")} />
            {vm.form.formState.errors.key && (
              <p className="text-xs text-red-500">
                {vm.form.formState.errors.key.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <FieldLabel className="text-xs font-bold text-muted-foreground uppercase">
              Display Value (UI) *
            </FieldLabel>
            <Input {...vm.form.register("value")} />
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
            onClick={onEditSubmit}
            disabled={vm.isSubmitting || !vm.form.formState.isDirty}
          >
            {vm.isSubmitting ? (
              <>
                <SpinnerCustom /> Updating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> Update Value
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
