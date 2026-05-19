import { Save, PlusCircle, Tag, Type, Loader2 } from "lucide-react";
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

interface EnumCreateModalProps {
  vm: ReturnType<typeof useEnumManagementViewModel>;
}

export function EnumCreateModal({ vm }: EnumCreateModalProps) {
  return (
    <Dialog
      open={vm.isCreateModalOpen}
      onOpenChange={(open) => !open && vm.closeModals()}
    >
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl">
        {/* Gradient bar */}
        <div className="h-1 w-full bg-gradient-to-r from-primary via-primary/70 to-primary/40" />

        <DialogHeader className="px-6 pt-5 pb-4 border-b bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <PlusCircle className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                Add System Value
              </DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                Add a new constant to the{" "}
                <span className="font-semibold text-foreground">
                  {vm.activeCategory}
                </span>{" "}
                category.
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
              placeholder="e.g., FALL_2026"
              {...vm.form.register("key")}
              className={`bg-background font-mono transition-all duration-150 focus-visible:ring-2 focus-visible:ring-ring/30 ${vm.form.formState.errors.key ? "border-destructive" : ""}`}
            />
            {vm.form.formState.errors.key && (
              <p className="text-xs text-destructive font-medium">
                {vm.form.formState.errors.key.message}
              </p>
            )}
            <p className="text-[10px] text-muted-foreground/80 leading-relaxed">
              Used by the database. Spaces will be auto-converted to
              underscores.
            </p>
          </div>

          <div className="space-y-2">
            <FieldLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Type className="h-3 w-3" />
              Display Value (UI) <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              placeholder="e.g., Fall Semester 2026"
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
            onClick={vm.handleCreateSubmit}
            disabled={vm.isSubmitting || !vm.form.formState.isValid}
            className="gap-1.5"
          >
            {vm.isSubmitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            {vm.isSubmitting ? "Saving…" : "Save Value"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
