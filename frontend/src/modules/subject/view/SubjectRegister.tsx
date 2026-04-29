import { useNavigate } from "react-router-dom";
import { Controller } from "react-hook-form";
import { BookOpen, PlusCircle, Save, X } from "lucide-react";

import { useSubjectRegisterViewModel } from "../viewModel/useSubjectRegisterViewModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="w-full max-w-7xl mx-auto space-y-6">
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
          <form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-muted/20 rounded-lg border">
              {/* --- SUBJECT NAME --- */}
              <div className="space-y-3">
                <Label className="text-muted-foreground uppercase text-xs font-bold tracking-wider">
                  Subject Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...vm.form.register("name")}
                  placeholder="e.g. Advanced Mathematics"
                  className="max-w-md bg-background"
                />
                {vm.form.formState.errors.name && (
                  <p className="text-xs text-red-500">
                    {vm.form.formState.errors.name.message}
                  </p>
                )}
              </div>

              {/* --- SUBJECT CODE --- */}
              <div className="space-y-3">
                <Label className="text-muted-foreground uppercase text-xs font-bold tracking-wider">
                  Subject Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...vm.form.register("code")}
                  placeholder="e.g. 316000"
                  className="max-w-md bg-background"
                />
                {vm.form.formState.errors.code && (
                  <p className="text-xs text-red-500">
                    {vm.form.formState.errors.code.message}
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
                {vm.form.formState.errors.branchId && (
                  <p className="text-xs text-red-500">
                    {vm.form.formState.errors.branchId.message}
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
                {vm.form.formState.errors.semesterId && (
                  <p className="text-xs text-red-500">
                    {vm.form.formState.errors.semesterId.message}
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
                disabled={vm.isCreating}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={vm.isCreating}
              >
                <Save className="w-4 h-4 mr-2" />
                {vm.isCreating ? "Creating..." : "Create Subject"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
