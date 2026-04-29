import { Settings, Save, CalendarClock, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SpinnerCustom } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { DynamicSelect } from "@/components/custom/dashboard/DynamicSelect";
import { PageBreadcrumb } from "@/components/custom/dashboard/PageBreadcrumb";
import { useNavigate } from "react-router-dom";

import { useSystemSettingsViewModel } from "../viewModel/useSystemSettingsViewModel";

export default function SystemSettingsView() {
  const navigate = useNavigate();
  const vm = useSystemSettingsViewModel();

  //  Block access if they don't have permission
  if (!vm.canManageSettings) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-xl font-bold text-red-500">Access Denied</h2>
        <p className="text-muted-foreground mt-2">
          You do not have permission to manage global system configurations.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate("/")}
        >
          Go to Dashboard
        </Button>
      </div>
    );
  }

  if (vm.isLoading) {
    return (
      <div className="w-full max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-6 w-48" />
        <div className="flex justify-between items-center pb-4 border-b">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <Skeleton className="h-75 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <PageBreadcrumb
        items={[
          { label: "Dashboard", onClick: () => navigate("/") },
          { label: "System Configuration" },
        ]}
      />

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Settings className="w-8 h-8 text-primary" />
            System Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage global configuration and academic parameters.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="shadow-sm border-border/50 overflow-hidden">
          <CardHeader className="bg-muted/20 border-b">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Academic Configuration</CardTitle>
            </div>
            <CardDescription>
              Set the active academic year. This controls which subjects and
              assignments are visible to students and staff by default.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            <Alert className="bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-300">
              <ShieldAlert className="h-4 w-4 text-amber-800! dark:text-amber-300!" />
              <AlertTitle>Global Impact Warning</AlertTitle>
              <AlertDescription>
                Changing the active academic year will immediately update the
                default view for all users across the entire system. Do this
                only at the start of a new academic session.
              </AlertDescription>
            </Alert>

            <div className="max-w-md space-y-2">
              <label className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
                Current Academic Year
              </label>
              <DynamicSelect
                value={vm.selectedYearId}
                onChange={vm.setSelectedYearId}
                options={vm.academicYearOptions}
                placeholder="Select Academic Year..."
              />
            </div>
          </CardContent>

          <CardFooter className="bg-muted/10 border-t px-6 py-4 flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {vm.hasChanges
                ? "You have unsaved changes."
                : "All configurations are up to date."}
            </p>
            <Button
              onClick={vm.onSave}
              disabled={!vm.hasChanges || vm.isSaving}
              className="gap-2 transition-all"
            >
              {vm.isSaving ? (
                <span className="flex items-center justify-center w-4 h-4">
                  <SpinnerCustom />
                </span>
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
