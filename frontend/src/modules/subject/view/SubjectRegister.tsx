import { useNavigate } from "react-router-dom";
import { Controller } from "react-hook-form";
import {
  BookOpen,
  PlusCircle,
  Save,
  X,
  ArrowLeft,
  Loader2,
  Building2,
  GraduationCap,
  Hash,
  Type,
} from "lucide-react";

import { useSubjectRegisterViewModel } from "../viewModel/useSubjectRegisterViewModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DynamicSelect } from "@/components/custom/dashboard/DynamicSelect";
import { Label } from "@/components/ui/label";
import { PageBreadcrumb } from "@/components/custom/dashboard/PageBreadcrumb";

export const SubjectRegisterModule = () => {
  const navigate = useNavigate();

  // 🚨 The View only consumes the ViewModel
  const vm = useSubjectRegisterViewModel();

  const handleSave = async () => {
    await vm.onSubmit();
    navigate(-1);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-12">
      <PageBreadcrumb
        items={[
          { label: "Subjects", icon: BookOpen, onClick: () => navigate(-1) },
          { label: "Register New Subject" },
        ]}
      />

      {/* ═══════════════════════════════════════
          MAIN CARD
          ═══════════════════════════════════════ */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
        {/* Gradient accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-primary/70 to-primary/40" />

        {/* Header */}
        <div className="flex items-center justify-between p-6 sm:p-8 border-b bg-muted/10">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <PlusCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                Add New Subject
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Create a new curriculum subject entry
              </p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 sm:p-8">
          <form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 rounded-xl border border-border/50 bg-muted/10 p-5 sm:p-6">
              {/* --- SUBJECT NAME --- */}
              <div className="space-y-2.5">
                <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Type className="h-3 w-3" />
                  Subject Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  {...vm.form.register("name")}
                  placeholder="e.g. Advanced Mathematics"
                  className="bg-background transition-all duration-150 focus-visible:ring-2 focus-visible:ring-ring/30"
                />
                {vm.form.formState.errors.name && (
                  <p className="text-xs text-destructive font-medium">
                    {vm.form.formState.errors.name.message}
                  </p>
                )}
              </div>

              {/* --- SUBJECT CODE --- */}
              <div className="space-y-2.5">
                <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Hash className="h-3 w-3" />
                  Subject Code <span className="text-destructive">*</span>
                </Label>
                <Input
                  {...vm.form.register("code")}
                  placeholder="e.g. 316000"
                  className="bg-background font-mono transition-all duration-150 focus-visible:ring-2 focus-visible:ring-ring/30"
                />
                {vm.form.formState.errors.code && (
                  <p className="text-xs text-destructive font-medium">
                    {vm.form.formState.errors.code.message}
                  </p>
                )}
              </div>

              {/* --- BRANCH --- */}
              <div className="space-y-2.5">
                <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Building2 className="h-3 w-3" />
                  Assigned Branch <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="branchId"
                  control={vm.form.control}
                  render={({ field }) => (
                    <DynamicSelect
                      value={field.value}
                      onChange={field.onChange}
                      options={vm.branchOptions}
                      placeholder="Select Branch"
                      isLoading={vm.isBranchesLoading}
                      disabled={!vm.canManageGlobal}
                    />
                  )}
                />
                {!vm.canManageGlobal && (
                  <p className="text-[10px] text-muted-foreground/80 leading-relaxed">
                    Branch is locked to your assigned department.
                  </p>
                )}
                {vm.form.formState.errors.branchId && (
                  <p className="text-xs text-destructive font-medium">
                    {vm.form.formState.errors.branchId.message}
                  </p>
                )}
              </div>

              {/* --- SEMESTER --- */}
              <div className="space-y-2.5">
                <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <GraduationCap className="h-3 w-3" />
                  Semester <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="semesterId"
                  control={vm.form.control}
                  render={({ field }) => (
                    <DynamicSelect
                      value={field.value}
                      onChange={field.onChange}
                      options={vm.semesterOptions}
                      placeholder="Select Semester"
                      isLoading={vm.isSemestersLoading}
                    />
                  )}
                />
                {vm.form.formState.errors.semesterId && (
                  <p className="text-xs text-destructive font-medium">
                    {vm.form.formState.errors.semesterId.message}
                  </p>
                )}
              </div>
            </div>

            {/* ── Action Buttons ── */}
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border/40">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => navigate(-1)}
                disabled={vm.isCreating}
                className="gap-1.5"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                disabled={vm.isCreating}
                className="gap-1.5"
              >
                {vm.isCreating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                {vm.isCreating ? "Creating…" : "Create Subject"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
