import { useCallback, useState } from "react";
import { BookOpen, Link2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldLabel } from "@/components/ui/field";
import { SpinnerCustom } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

import { AsyncCombobox } from "@/components/custom/dashboard/AsyncCombobox";
import { PageBreadcrumb } from "@/components/custom/dashboard/PageBreadcrumb";
import { useSubjectAssignmentViewModel } from "../viewModel/useSubjectAssignmentViewModel";
import { searchStaff, searchSubjects } from "../model/subjectMappingService";
import { useEnumViewModel } from "@/modules/enums/viewModel/useEnumViewModel";
import { EnumCategory } from "@/modules/enums/types/enum.schemas";
import { useBranchViewModel } from "@/modules/branch/viewModel/useBranchViewModel";
import { useAppSelector } from "@/store/hook";
import { ROLES } from "@/core/Constants/enums/role-enum-value";
import { ActiveAssignmentsTable } from "@/modules/subject-mapping/view/ActiveAssignmentsTable";
import type {
  ActiveAssignmentTableResponse,
  SubjectComboboxDTO,
} from "@/modules/subject-mapping/types/subject-mapping.types";
import type { BranchResponse } from "@/modules/subject/types/subject.schemas";

export default function SubjectAssignmentView() {
  const navigate = useNavigate();

  //  ALL Logic is now encapsulated in the ViewModel!
  const vm = useSubjectAssignmentViewModel();

  const { user } = useAppSelector((state) => state.auth);
  if (!user) return null;
  const isSuperAdmin: boolean = user.role === ROLES.SUPER_ADMIN;

  const { enums: semesters, isLoading: isSemLoading } = useEnumViewModel(
    EnumCategory.SEMESTER,
  );
  const { enums: academicYears, isLoading: isYearLoading } = useEnumViewModel(
    EnumCategory.ACADEMIC_YEAR,
  );
  const { branches, isLoading: isBranchesLoading } = useBranchViewModel();

  const [selectedBranchId, setSelectedBranchId] = useState<number | undefined>(
    undefined,
  );

  const currentYearId = vm.form.watch("academicYearId");
  const activeYearDisplay =
    academicYears?.find((y) => y.id === currentYearId)?.value || "Loading...";

  const activeSemesterId = vm.form.watch("semesterId");

  const fetchStaffMemoized = useCallback(
    (term: string) => searchStaff(term, selectedBranchId),
    [selectedBranchId],
  );

  const fetchSubjectsMemoized = useCallback(
    (term: string) => searchSubjects(term, activeSemesterId, selectedBranchId),
    [activeSemesterId, selectedBranchId],
  );

  const handleSubjectSelect = (
    subjectId: number | null,
    rawData?: SubjectComboboxDTO | null,
  ) => {
    if (!subjectId) {
      vm.form.setValue("subjectId", undefined as unknown as number, {
        shouldValidate: true,
      });
      vm.form.setValue("semesterId", undefined as unknown as number, {
        shouldValidate: true,
      });
      return;
    }

    vm.form.setValue("subjectId", subjectId, { shouldValidate: true });

    if (rawData?.semester && semesters) {
      const semString = rawData.semester;
      const matchedSem = semesters.find(
        (s) => s.key === semString || s.value === semString,
      );

      if (matchedSem) {
        vm.form.setValue("semesterId", matchedSem.id, { shouldValidate: true });
      }
    }
  };

  if (isSemLoading || isYearLoading || (isSuperAdmin && isBranchesLoading)) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
        <Skeleton className="h-6 w-64" />
        <div className="pb-4 border-b">
          <Skeleton className="h-10 w-72 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      <PageBreadcrumb
        items={[
          { label: "Dashboard", onClick: () => navigate("/") },
          { label: "Subject Allocation Matrix" },
        ]}
      />

      <div className="flex items-center gap-3 pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Link2 className="w-8 h-8 text-primary" />
            Subject Allocation
          </h1>
          <p className="text-muted-foreground mt-1">
            Assign subjects to professors. Changes are logged and instantly
            visible to students.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-sm border-primary/20 sticky top-6">
            <CardHeader className="bg-primary/5 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                New Assignment
              </CardTitle>
              <CardDescription>
                Search for a professor and subject to link them.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              {isSuperAdmin && (
                <div className="space-y-1.5">
                  <FieldLabel className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" /> Select Target Branch
                  </FieldLabel>
                  <Select
                    value={
                      selectedBranchId ? String(selectedBranchId) : undefined
                    }
                    onValueChange={(val) => {
                      setSelectedBranchId(Number(val));
                      vm.form.setValue(
                        "professorId",
                        undefined as unknown as number,
                        {
                          shouldValidate: true,
                        },
                      );
                      vm.form.setValue(
                        "subjectId",
                        undefined as unknown as number,
                        {
                          shouldValidate: true,
                        },
                      );
                      vm.form.setValue(
                        "semesterId",
                        undefined as unknown as number,
                        {
                          shouldValidate: true,
                        },
                      );
                    }}
                  >
                    <SelectTrigger className="bg-background border-primary/30 shadow-sm">
                      <SelectValue placeholder="Select Branch to Search..." />
                    </SelectTrigger>
                    <SelectContent>
                      {branches?.map((branch: BranchResponse) => (
                        <SelectItem
                          key={branch.id}
                          value={branch.id.toString()}
                        >
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-1.5">
                <FieldLabel className="text-xs font-bold text-muted-foreground uppercase">
                  Select Professor / HOD
                </FieldLabel>
                <AsyncCombobox
                  key={`prof-combo-${selectedBranchId || "all"}`}
                  placeholder="Type name to search..."
                  value={vm.form.watch("professorId")}
                  onChange={(val) =>
                    vm.form.setValue("professorId", val as any, {
                      shouldValidate: true,
                    })
                  }
                  fetchOptions={fetchStaffMemoized}
                  emptyText="No professors found."
                  disabled={isSuperAdmin && !selectedBranchId}
                />
              </div>

              <div className="space-y-1.5">
                <FieldLabel className="text-xs font-bold text-muted-foreground uppercase">
                  Select Subject
                </FieldLabel>
                <AsyncCombobox
                  key={`sub-combo-${selectedBranchId || "all"}`}
                  placeholder="Type subject name or code..."
                  value={vm.form.watch("subjectId")}
                  onChange={handleSubjectSelect}
                  fetchOptions={fetchSubjectsMemoized}
                  emptyText="No subjects found."
                  disabled={isSuperAdmin && !selectedBranchId}
                />
              </div>

              <div className="space-y-1.5">
                <FieldLabel className="text-xs font-bold text-muted-foreground uppercase">
                  Semester
                </FieldLabel>
                <Select
                  disabled={isSemLoading || true}
                  key={`semester-select-${vm.form.watch("semesterId") || "empty"}`}
                  value={
                    vm.form.watch("semesterId")
                      ? String(vm.form.watch("semesterId"))
                      : undefined
                  }
                  onValueChange={(val) =>
                    vm.form.setValue("semesterId", Number(val), {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters?.map((sem) => (
                      <SelectItem key={sem.id} value={sem.id.toString()}>
                        {sem.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground mt-1">
                  *Auto-fills when a subject is selected.
                </p>
              </div>

              <div className="pt-4 border-t border-border/50 space-y-2">
                <FieldLabel className="text-xs font-bold text-muted-foreground uppercase">
                  Active Academic Year
                </FieldLabel>
                <div className="flex items-center gap-3">
                  <Badge
                    variant="secondary"
                    className="text-sm px-3 py-1 bg-primary/10 text-primary border-primary/20"
                  >
                    {isYearLoading ? "Loading..." : activeYearDisplay}
                  </Badge>
                  <span className="text-xs text-muted-foreground italic">
                    Locked to global system
                  </span>
                </div>
              </div>

              <Button
                onClick={vm.onSubmit}
                disabled={vm.isAssigning || !vm.form.formState.isValid}
                className="w-full mt-4"
              >
                {vm.isAssigning ? (
                  <span className="flex items-center justify-center w-4 h-4 mr-2">
                    <SpinnerCustom />
                  </span>
                ) : (
                  <Link2 className="w-4 h-4 mr-2" />
                )}
                Assign Subject
              </Button>
            </CardContent>
          </Card>
        </div>

        {/*  DELEGATE EVERYTHING TO THE DUMB COMPONENT */}
        <div className="lg:col-span-2">
          <ActiveAssignmentsTable
            isSuperAdmin={isSuperAdmin}
            branches={branches || []}
            academicYears={academicYears || []} // 🚀 Pass the years down
            search={vm.table.search}
            onSearchChange={vm.table.setSearch}
            branchId={vm.table.branchId}
            onBranchChange={vm.table.setBranchId}
            academicYearId={vm.table.academicYearId} 
            onAcademicYearChange={vm.table.setAcademicYearId}
            
            data={(vm.table.data as ActiveAssignmentTableResponse[]) || []}
            isLoading={vm.table.isLoading}
            onUnassign={vm.table.onUnassign}
            isUnassigning={vm.table.isUnassigning}
          />
        </div>
      </div>
    </div>
  );
}
