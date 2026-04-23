import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookOpen, PlusCircle, Save, X } from "lucide-react";

import { useAppSelector } from "@/store/hook";
import { ROLES } from "@/core/Constants/enums/role-enum-value";
import { useBranchViewModel } from "@/modules/branch/viewModel/useBranchViewModel";
import { useEnumViewModel } from "@/modules/enums/viewModel/useEnumViewModel";
import { EnumCategory } from "@/modules/enums/types/enum.schemas";
import {
  createSubjectSchema,
  type BranchResponse,
  type CreateSubjectPayload,
  type SemesterResponse,
} from "../types/subject.schemas";
import { useSubjectRegisterViewModel } from "../viewModel/useSubjectRegisterViewModel";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DynamicSelect } from "@/components/custom/dashboard/DynamicSelect";
import { Label } from "@/components/ui/label";
import { PageBreadcrumb } from "@/components/custom/dashboard/PageBreadcrumb";

export const SubjectRegisterModule = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const canEditBranch = user?.role === ROLES.SUPER_ADMIN;

  // ViewModels
  const { createSubject, isCreating } = useSubjectRegisterViewModel();
  const { branches, isLoading: isBranchesLoading } = useBranchViewModel();
  const { enums: semesters, isLoading: isSemestersLoading } = useEnumViewModel(
    EnumCategory.SEMESTER,
  );

  const branchOptions =
    branches?.map((b: BranchResponse) => ({ id: b.id, label: b.name })) || [];
  const semesterOptions =
    semesters?.map((s: SemesterResponse) => ({ id: s.id, label: s.value })) ||
    [];

  // Setup Form
  const form = useForm<CreateSubjectPayload>({
    resolver: zodResolver(createSubjectSchema),
    defaultValues: {
      name: "",
      code: "",
      // Pre-fill the branch ID if they are an HOD
      branchId: user?.role === ROLES.HOD ? user?.branchId : undefined,
      semesterId: undefined,
    },
  });

  const onSubmit = async (data: CreateSubjectPayload) => {
    await createSubject(data);
    navigate(-1);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/*  Breadcrumb for  navigation */}
      <PageBreadcrumb
        items={[
          { label: "Subjects", icon: BookOpen, onClick: () => navigate(-1) },
          { label: "Register New Subject" },
        ]}
      />

      <Card className="border-none shadow-md">
        <CardHeader className="pb-4 border-b">
          <CardTitle className="text-2xl flex items-center gap-2">
            <PlusCircle className="w-6 h-6 text-primary" />
            Add New Subject
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-muted/20 rounded-lg border">
              {/* --- SUBJECT NAME --- */}
              <div className="space-y-3">
                <Label className="text-muted-foreground uppercase text-xs font-bold tracking-wider">
                  Subject Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...form.register("name")}
                  placeholder="e.g. Advanced Mathematics"
                  className="max-w-md bg-background"
                />
                {form.formState.errors.name && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              {/* --- SUBJECT CODE --- */}
              <div className="space-y-3">
                <Label className="text-muted-foreground uppercase text-xs font-bold tracking-wider">
                  Subject Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...form.register("code")}
                  placeholder="e.g. 316000"
                  className="max-w-md bg-background"
                />
                {form.formState.errors.code && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.code.message}
                  </p>
                )}
              </div>

              {/* --- BRANCH --- */}
              <div className="space-y-3">
                <Label className="text-muted-foreground uppercase text-xs font-bold tracking-wider">
                  Assigned Branch <span className="text-red-500">*</span>
                </Label>
                <div className="max-w-md">
                  <Controller
                    name="branchId"
                    control={form.control}
                    render={({ field }) => (
                      <DynamicSelect
                        value={field.value}
                        onChange={field.onChange}
                        options={branchOptions}
                        placeholder="Select Branch"
                        isLoading={isBranchesLoading}
                        disabled={!canEditBranch}
                      />
                    )}
                  />
                  {!canEditBranch && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Branch is locked to your assigned department.
                    </p>
                  )}
                </div>
                {form.formState.errors.branchId && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.branchId.message}
                  </p>
                )}
              </div>

              {/* --- SEMESTER --- */}
              <div className="space-y-3">
                <Label className="text-muted-foreground uppercase text-xs font-bold tracking-wider">
                  Semester <span className="text-red-500">*</span>
                </Label>
                <div className="max-w-md">
                  <Controller
                    name="semesterId"
                    control={form.control}
                    render={({ field }) => (
                      <DynamicSelect
                        value={field.value}
                        onChange={field.onChange}
                        options={semesterOptions}
                        placeholder="Select Semester"
                        isLoading={isSemestersLoading}
                      />
                    )}
                  />
                </div>
                {form.formState.errors.semesterId && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.semesterId.message}
                  </p>
                )}
              </div>
            </div>

            {/* --- ACTION BUTTONS --- */}
            <div className="flex justify-end gap-4 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={isCreating}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                <Save className="w-4 h-4 mr-2" />
                {isCreating ? "Creating..." : "Create Subject"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
