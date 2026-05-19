import { Loader2, ShieldAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { usePermissionSaveViewModel } from "../viewModel/usePermissionSaveViewModel";
import type { LocalOverride } from "@/modules/users/types/permission.interface";

interface PermissionSaveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  personalInfoId: string;
  localOverrides: Map<string, LocalOverride>;
  onSuccess: () => void;
}

export default function PermissionSaveDialog(props: PermissionSaveDialogProps) {
  // Delegate all logic to the ViewModel
  const vm = usePermissionSaveViewModel({
    personalInfoId: props.personalInfoId,
    localOverrides: props.localOverrides,
    onClose: props.onClose,
    onSuccessCallback: props.onSuccess,
  });

  return (
    <Dialog open={props.isOpen} onOpenChange={vm.handleOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            <DialogTitle>Confirm Permission Changes</DialogTitle>
          </div>
          <DialogDescription>
            You are about to modify <strong>{vm.dirtyCount}</strong> permission{" "}
            {vm.dirtyCount === 1 ? "override" : "overrides"} for this user. This
            action will be recorded in the system audit logs.
          </DialogDescription>
        </DialogHeader>

        {/* Standard HTML Form powered by react-hook-form */}
        <form onSubmit={vm.onSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="reason">
              Audit Justification <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="e.g., Requested by HOD for upcoming semester grading..."
              className="resize-none h-24"
              disabled={vm.isPending}
              {...vm.form.register("reason")}
            />
            {/* Simple Error Message Display */}
            {vm.form.formState.errors.reason && (
              <p className="text-[0.8rem] font-medium text-destructive">
                {vm.form.formState.errors.reason.message}
              </p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => vm.handleOpenChange(false)}
              disabled={vm.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={vm.isPending}>
              {vm.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
