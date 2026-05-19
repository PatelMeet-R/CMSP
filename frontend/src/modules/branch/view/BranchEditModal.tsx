import { Building2, Save } from "lucide-react";
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

import { useBranchEditViewModel } from "../viewModel/useBranchEditViewModel";
import type { Branch } from "../types/branch.schemas";

interface BranchEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: Branch | null;
}

export function BranchEditModal({
  isOpen,
  onClose,
  branch,
}: BranchEditModalProps) {
  const vm = useBranchEditViewModel(branch);

  const handleSave = async () => {
    await vm.onSubmit();
    onClose(); // Close modal after successful save
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Edit Branch
          </DialogTitle>
          <DialogDescription>
            Make changes to the branch details below.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <FieldLabel className="text-xs font-bold text-muted-foreground uppercase">
              Branch Name
            </FieldLabel>
            <Input {...vm.form.register("name")} />
            {vm.form.formState.errors.name && (
              <p className="text-xs text-red-500">
                {vm.form.formState.errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <FieldLabel className="text-xs font-bold text-muted-foreground uppercase">
              Branch Code
            </FieldLabel>
            <Input {...vm.form.register("code")} />
            {vm.form.formState.errors.code && (
              <p className="text-xs text-red-500">
                {vm.form.formState.errors.code.message}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={vm.isUpdating}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={vm.isUpdating || !vm.form.formState.isDirty}
          >
            {vm.isUpdating ? (
              <>
                <SpinnerCustom /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
