import { useParams, useNavigate } from "react-router-dom";
import { Controller } from "react-hook-form";
import { BookOpen, Edit2, X, Save, ArrowLeft } from "lucide-react";

import { useSubjectDetailViewModel } from "@/modules/subject/viewModel/useSubjectDetailModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DynamicSelect } from "@/components/custom/dashboard/DynamicSelect";
import { Label } from "@/components/ui/label";
import { PageBreadcrumb } from "@/components/custom/dashboard/PageBreadcrumb";

export const SubjectDetailModule = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  //  The View only consumes the ViewModel
  const vm = useSubjectDetailViewModel(id);

  const { isDirty } = vm.form.formState;

  // --- RENDER Skeleton ---
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-muted/10 rounded-lg border">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full max-w-sm" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <PageBreadcrumb
        items={[
          { label: "Subjects", icon: BookOpen, onClick: () => navigate(-1) },
          { label: vm.subject?.code || "", isLoading: vm.isFetching },
        ]}
      />

      <Card className="border-none shadow-md">
        <CardHeader className="pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="shrink-0 hidden sm:flex"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <CardTitle className="text-2xl">
                {vm.isFetching ? (
                  <Skeleton className="h-8 w-64" />
                ) : (
                  vm.subject?.name
                )}
              </CardTitle>
              {!vm.isFetching && vm.subject && (
                <div className="text-sm text-muted-foreground mt-1 font-mono">
                  Code: {vm.subject.code}
                </div>
              )}
            </div>
          </div>

          {/* --- ACTION BUTTONS --- */}
          {vm.canEdit && !vm.isFetching && (
            <div className="shrink-0 w-full sm:w-auto">
              {!vm.isEditing ? (
                <Button
                  onClick={() => vm.setIsEditing(true)}
                  className="w-full sm:w-auto"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={vm.handleCancel}
                    disabled={vm.isUpdating}
                    className="flex-1 sm:flex-none"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={vm.onSubmit}
                    disabled={!isDirty || vm.isUpdating}
                    className="flex-1 sm:flex-none"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {vm.isUpdating ? "Saving..." : "Save"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-6">
          {vm.isFetching ? (
            <LoadingSkeleton />
          ) : (
            <form>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-muted/20 rounded-lg border">
                {/* --- SUBJECT NAME --- */}
                <div className="space-y-3">
                  <Label className="text-muted-foreground uppercase text-xs font-bold tracking-wider">
                    Subject Name
                  </Label>
                  {!vm.isEditing ? (
                    <div className="text-base font-medium">
                      {vm.subject?.name}
                    </div>
                  ) : (
                    <Input
                      {...vm.form.register("name")}
                      placeholder="Enter subject name"
                      className="max-w-md bg-background"
                    />
                  )}
                  {vm.form.formState.errors.name && (
                    <p className="text-xs text-red-500">
                      {vm.form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                {/* --- SUBJECT CODE --- */}
                <div className="space-y-3">
                  <Label className="text-muted-foreground uppercase text-xs font-bold tracking-wider">
                    Subject Code
                  </Label>
                  {!vm.isEditing ? (
                    <Badge
                      variant="outline"
                      className="text-sm font-mono px-3 py-1 bg-background"
                    >
                      {vm.subject?.code}
                    </Badge>
                  ) : (
                    <Input
                      {...vm.form.register("code")}
                      placeholder="Enter subject code"
                      className="max-w-md bg-background"
                    />
                  )}
                  {vm.form.formState.errors.code && (
                    <p className="text-xs text-red-500">
                      {vm.form.formState.errors.code.message}
                    </p>
                  )}
                </div>

                {/* --- BRANCH --- */}
                <div className="space-y-3">
                  <Label className="text-muted-foreground uppercase text-xs font-bold tracking-wider">
                    Assigned Branch
                  </Label>
                  {!vm.isEditing ? (
                    <div className="text-base font-medium">
                      {vm.subject?.branch?.name || "N/A"}
                    </div>
                  ) : (
                    <div className="max-w-md">
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
                        <p className="text-xs text-muted-foreground mt-1">
                          Branch is locked to your assigned department.
                        </p>
                      )}
                    </div>
                  )}
                  {vm.form.formState.errors.branchId && (
                    <p className="text-xs text-red-500">
                      {vm.form.formState.errors.branchId.message}
                    </p>
                  )}
                </div>

                {/* --- SEMESTER --- */}
                <div className="space-y-3">
                  <Label className="text-muted-foreground uppercase text-xs font-bold tracking-wider">
                    Semester
                  </Label>
                  {!vm.isEditing ? (
                    <div className="text-base font-medium">
                      {vm.subject?.semester?.value || "N/A"}
                    </div>
                  ) : (
                    <div className="max-w-md">
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
                    </div>
                  )}
                  {vm.form.formState.errors.semesterId && (
                    <p className="text-xs text-red-500">
                      {vm.form.formState.errors.semesterId.message}
                    </p>
                  )}
                </div>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
