import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  XCircle,
  Search,

  Building2,
  GraduationCap,
} from "lucide-react";
import { useSubjectViewModel } from "@/modules/subject/viewModel/useSubjectViewModel";
import { DebouncedSearchInput } from "@/components/custom/dashboard/SearchInput";
import { DynamicSelect } from "@/components/custom/dashboard/DynamicSelect";
import { DataTablePagination } from "@/components/custom/dashboard/DataTablePagination";
import { SubjectTable } from "@/modules/subject/view/SubjectTable";
import { Button } from "@/components/ui/button";
import { ROUTENAME } from "@/core/Constants/RouteName";

export const SubjectModule = () => {
  const navigate = useNavigate();
  const vm = useSubjectViewModel();

  return (
    <div className="w-full max-w-screen-2xl mx-auto space-y-6">
      {/* ═══════════════════════════════════════
          HEADER
          ═══════════════════════════════════════ */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
        {/* Gradient accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-primary/70 to-primary/40" />

        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                  Curriculum Subjects
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Manage and view academic subjects
                  {vm.canManageGlobal
                    ? " across all branches"
                    : " for your branch"}
                  .
                </p>
              </div>
            </div>
          </div>

          {/* ── Toolbar ── */}
          <div className="mt-6 flex flex-col lg:flex-row gap-3 items-end rounded-xl border border-border/50 bg-muted/20 p-4">
            <div className="flex-1 w-full">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1 block">
                <Search className="h-3 w-3" />
                Search
              </label>
              <DebouncedSearchInput
                value={vm.search}
                onChange={vm.setSearch}
                placeholder="Search by name or code…"
              />
            </div>

            <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full lg:w-auto items-end">
              {/* PBAC Gate for Branch Selection */}
              {vm.canManageGlobal && (
                <div className="w-full sm:w-50">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1 block">
                    <Building2 className="h-3 w-3" />
                    Branch
                  </label>
                  <DynamicSelect
                    value={vm.branchId}
                    onChange={vm.setBranchId}
                    options={vm.branchOptions}
                    placeholder="Branch"
                    isLoading={vm.isBranchesLoading}
                  />
                </div>
              )}

              <div className="w-full sm:w-45">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1 block">
                  <GraduationCap className="h-3 w-3" />
                  Semester
                </label>
                <DynamicSelect
                  value={vm.semesterId}
                  onChange={vm.setSemesterId}
                  options={vm.semesterOptions}
                  placeholder="Semester"
                  isLoading={vm.isSemestersLoading}
                />
              </div>

              {vm.hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 gap-1.5 shrink-0 transition-all duration-150"
                  onClick={vm.clearFilters}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* ── Data Table ── */}
        <div className="border-t">
          <SubjectTable
            subjects={vm.subjects}
            isLoading={vm.isLoading}
            showBranchColumn={vm.canManageGlobal}
            onRowClick={(id) =>
              navigate(
                ROUTENAME.SUBJECT_DETAILS.replace(":id", id.toString()),
              )
            }
          />
        </div>

        {/* ── Pagination ── */}
        {vm.meta && (
          <div className="px-6 sm:px-8 py-4 border-t bg-muted/10">
            <DataTablePagination
              meta={vm.meta}
              onPageChange={vm.setPage}
              onLimitChange={vm.setLimit}
            />
          </div>
        )}
      </div>
    </div>
  );
};
