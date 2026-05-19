import { useParams, useNavigate } from "react-router-dom";
import { Controller } from "react-hook-form";
import {
  BookOpen,
  Edit2,
  X,
  Save,
  ArrowLeft,
  Loader2,
  Hash,
  Type,
  Building2,
  GraduationCap,
} from "lucide-react";

import { useSubjectDetailViewModel } from "@/modules/subject/viewModel/useSubjectDetailModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DynamicSelect } from "@/components/custom/dashboard/DynamicSelect";
import { Label } from "@/components/ui/label";
import { PageBreadcrumb } from "@/components/custom/dashboard/PageBreadcrumb";

// ─────────────────────────────────────────────
//  Read-only Info Tile
// ─────────────────────────────────────────────
function InfoTile({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3.5 rounded-xl border border-border/50 bg-card p-4 transition-all hover:border-border hover:shadow-sm">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span
          className={`text-sm font-semibold text-foreground truncate ${mono ? "font-mono" : ""}`}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════
//  MAIN COMPONENT
// ═════════════════════════════════════════════
export const SubjectDetailModule = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  //  The View only consumes the ViewModel
  const vm = useSubjectDetailViewModel(id);

  const { isDirty } = vm.form.formState;

  // ── SKELETON LOADER ──
  if (vm.isFetching) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6 pb-12">
        <Skeleton className="h-5 w-56" />
        <div className="rounded-2xl border overflow-hidden">
          <Skeleton className="h-1.5 w-full" />
          <div className="p-8 space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-56" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-12">
      <PageBreadcrumb
        items={[
          { label: "Subjects", icon: BookOpen, onClick: () => navigate(-1) },
          { label: vm.subject?.code || "", isLoading: vm.isFetching },
        ]}
      />

      {/* ═══════════════════════════════════════
          DETAIL CARD
          ═══════════════════════════════════════ */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
        {/* Gradient accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-primary/70 to-primary/40" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 border-b bg-muted/10">
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
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                {vm.subject?.name}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge
                  variant="outline"
                  className="text-[10px] font-mono bg-primary/5 text-primary border-primary/20 px-2 py-0.5"
                >
                  {vm.subject?.code}
                </Badge>
              </div>
            </div>
          </div>

          {/* ── Action Buttons ── */}
          {vm.canEdit && (
            <div className="shrink-0 w-full sm:w-auto">
              {!vm.isEditing ? (
                <Button
                  onClick={() => vm.setIsEditing(true)}
                  size="sm"
                  className="gap-2 w-full sm:w-auto"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={vm.handleCancel}
                    disabled={vm.isUpdating}
                    className="flex-1 sm:flex-none gap-1.5"
                  >
                    <X className="h-3.5 w-3.5" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={vm.onSubmit}
                    disabled={!isDirty || vm.isUpdating}
                    className="flex-1 sm:flex-none gap-1.5"
                  >
                    {vm.isUpdating ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    {vm.isUpdating ? "Saving…" : "Save"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {!vm.isEditing ? (
            /* ── READ-ONLY: Bento Tiles ── */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoTile
                icon={Type}
                label="Subject Name"
                value={vm.subject?.name || "N/A"}
              />
              <InfoTile
                icon={Hash}
                label="Subject Code"
                value={vm.subject?.code || "N/A"}
                mono
              />
              <InfoTile
                icon={Building2}
                label="Assigned Branch"
                value={vm.subject?.branch?.name || "N/A"}
              />
              <InfoTile
                icon={GraduationCap}
                label="Semester"
                value={vm.subject?.semester?.value || "N/A"}
              />
            </div>
          ) : (
            /* ── EDIT MODE: Form ── */
            <form>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 rounded-xl border border-border/50 bg-muted/10 p-5 sm:p-6">
                {/* --- SUBJECT NAME --- */}
                <div className="space-y-2.5">
                  <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Type className="h-3 w-3" />
                    Subject Name
                  </Label>
                  <Input
                    {...vm.form.register("name")}
                    placeholder="Enter subject name"
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
                    Subject Code
                  </Label>
                  <Input
                    {...vm.form.register("code")}
                    placeholder="Enter subject code"
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
                    Assigned Branch
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
                    Semester
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
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
