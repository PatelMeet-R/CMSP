import { useNavigate } from "react-router-dom";
import { Building2, Save, X, PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FieldLabel } from "@/components/ui/field";
import { SpinnerCustom } from "@/components/ui/spinner";
import { PageBreadcrumb } from "@/components/custom/dashboard/PageBreadcrumb";

import { useBranchRegisterViewModel } from "../viewModel/useBranchRegisterViewModel";

export default function BranchRegisterView() {
  const navigate = useNavigate();
  const vm = useBranchRegisterViewModel();

  if (!vm.canCreate) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-xl font-bold text-red-500">Access Denied</h2>
        <p className="text-muted-foreground mt-2">
          You do not have permission to create branches.
        </p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-12">
      <PageBreadcrumb
        items={[
          { label: "Dashboard", onClick: () => navigate("/") },
          { label: "Branches", onClick: () => navigate("/branches") },
          { label: "Register Branch" },
        ]}
      />

      <div className="flex items-center justify-between pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Building2 className="w-8 h-8 text-primary" />
            Register New Branch
          </h1>
          <p className="text-muted-foreground mt-1">
            Add a new physical or academic branch to the system.
          </p>
        </div>
      </div>

      <Card className="shadow-sm border-primary/10">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-primary" /> Branch Details
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <FieldLabel className="text-xs font-bold text-muted-foreground uppercase">
                  Branch Name *
                </FieldLabel>
                <Input
                  placeholder="e.g., Computer Science"
                  {...vm.form.register("name")}
                  className={
                    vm.form.formState.errors.name ? "border-red-500" : ""
                  }
                />
                {vm.form.formState.errors.name && (
                  <p className="text-xs text-red-500">
                    {vm.form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <FieldLabel className="text-xs font-bold text-muted-foreground uppercase">
                  Branch Code *
                </FieldLabel>
                <Input
                  placeholder="e.g., CSE"
                  {...vm.form.register("code")}
                  className={
                    vm.form.formState.errors.code ? "border-red-500" : ""
                  }
                />
                {vm.form.formState.errors.code && (
                  <p className="text-xs text-red-500">
                    {vm.form.formState.errors.code.message}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-6 border-t flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={vm.isCreating}
              >
                <X className="w-4 h-4 mr-2" /> Cancel
              </Button>
              <Button
                type="button"
                onClick={vm.onSubmit}
                disabled={vm.isCreating || !vm.form.formState.isValid}
              >
                {vm.isCreating ? (
                  <>
                    <SpinnerCustom /> Registering...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Branch
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
