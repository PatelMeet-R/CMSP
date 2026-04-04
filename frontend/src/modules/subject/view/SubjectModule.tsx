import { useNavigate } from "react-router-dom";
import { BookOpen, XCircle } from "lucide-react";
import { useSubjectViewModel } from "@/modules/subject/viewModel/useSubjectViewModel";
import { DebouncedSearchInput } from "@/components/custom/dashboard/SearchInput";
import { DynamicSelect } from "@/components/custom/dashboard/DynamicSelect";
import { DataTablePagination } from "@/components/custom/dashboard/DataTablePagination";
import { SubjectTable } from "@/modules/subject/view/SubjectTable";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/store/hook";
import { ROLES } from "@/core/Constants/enums/role-enum-value";
import { useBranchViewModel } from "@/modules/branch/viewModel/useBranchViewModel";
import { useEnumViewModel } from "@/modules/enums/viewModel/useEnumViewModel";
import { EnumCategory } from "@/modules/enums/types/enum.schemas";

export const SubjectModule = () => {
  const navigate = useNavigate();
  const vm = useSubjectViewModel();

  const { user } = useAppSelector((state) => state.auth);

  const isSuperAdmin = user?.role === ROLES.SUPER_ADMIN;
  const { branches, isLoading: isBranchesLoading } = useBranchViewModel();
  const { enums: semesters, isLoading: isSemestersLoading } = useEnumViewModel(
    EnumCategory.SEMESTER,
  );
  // 3. Format the data for the DynamicSelect component
  const branchOptions =
    branches?.map((b: any) => ({ id: b.id, label: b.name })) || [];
  const semesterOptions =
    semesters?.map((s: any) => ({ id: s.id, label: s.value })) || [];

  // Check if any filter is currently active
  const hasActiveFilters = Boolean(vm.search || vm.branchId || vm.semesterId);

  return (
    <div className="w-full max-w-350 mx-auto p-4 md:p-6 space-y-6">
      <Card className="border-none shadow-md">
        {/* --- HEADER --- */}
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            Curriculum Subjects
          </CardTitle>
          <CardDescription>
            Manage and view academic subjects{" "}
            {isSuperAdmin ? "across all branches" : "for your branch"}.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* --- TOOLBAR --- */}
          <div className="flex flex-col lg:flex-row gap-4 items-end bg-muted/30 p-4 rounded-lg border">
            {/* Reusable Search Component */}
            <div className="flex-1 w-full">
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                Search
              </label>
              <DebouncedSearchInput
                value={vm.search}
                onChange={vm.setSearch}
                placeholder="Search by name or code..."
              />
            </div>

            <div className="flex flex-wrap sm:flex-nowrap gap-4 w-full lg:w-auto items-end">
              {/* Conditional Branch Dropdown */}
              {isSuperAdmin && (
                <div className="w-full sm:w-50">
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                    Branch
                  </label>
                  <DynamicSelect
                    value={vm.branchId}
                    onChange={vm.setBranchId}
                    options={branchOptions || []}
                    placeholder="Branch"
                    isLoading={isBranchesLoading}
                  />
                </div>
              )}

              {/* Semester Dropdown */}
              <div className="w-full sm:w-45">
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                  Semester
                </label>
                <DynamicSelect
                  value={vm.semesterId}
                  onChange={vm.setSemesterId}
                  options={semesterOptions || []}
                  placeholder="Semester"
                  isLoading={isSemestersLoading}
                />
              </div>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 px-3"
                  onClick={vm.clearFilters}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* --- DATA TABLE --- */}
          <SubjectTable
            subjects={vm.subjects}
            isLoading={vm.isLoading}
            isSuperAdmin={isSuperAdmin}
            onRowClick={(id) => navigate(`/subjects/${id}`)}
          />

          {/* --- PAGINATION --- */}
          {vm.meta && (
            <DataTablePagination
              meta={vm.meta}
              onPageChange={vm.setPage}
              // If you add a setLimit method to your ViewModel, you can wire it up here!
              // For now, we'll just log it or pass a dummy function if it's fixed at 10.
              onLimitChange={(newLimit) =>
                console.log("Limit changed to", newLimit)
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
