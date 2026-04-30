import { Users, ArrowLeft, UserPlus, Info, Mail } from "lucide-react";
import { Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { FieldLabel } from "@/components/ui/field";
import { SpinnerCustom } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { useCreateStaffViewModel } from "../viewModel/useCreateStaffViewModel";
import { PageBreadcrumb } from "@/components/custom/dashboard/PageBreadcrumb";
import { DynamicSelect } from "@/components/custom/dashboard/DynamicSelect";
import { useBranchViewModel } from "@/modules/branch/viewModel/useBranchViewModel";
import { usePermissions } from "@/hooks/usePermissions";
import { ROLES } from "@/core/Constants/enums/role-enum-value";

export default function CreateStaffView() {
  const { form, onSubmit, isSubmitting, navigate, roles, isRolesLoading } =
    useCreateStaffViewModel();

  const { hasPermission } = usePermissions();
  const canAssignHOD = hasPermission("*:*") || hasPermission("user:assign-hod");
  const canSelectBranch =
    hasPermission("*:*") || hasPermission("user:filter-branch");

  const { branches, isLoading: isBranchesLoading } = useBranchViewModel();
  const branchOptions =
    branches?.map((b) => ({ id: b.id, label: b.name })) || [];

  //  PBAC Role Filtering
  const availableRoles =
    roles
      ?.filter((r) => {
        if (
          r.name === ROLES.SUPER_ADMIN ||
          "SUPER_ADMIN" ||
          r.name === ROLES.STUDENT ||
          "STUDENT"
        )
          return false;
        if (r.name === ROLES.HOD || "HOD") return canAssignHOD;
        return true; // Assume can assign PROFESSOR
      })
      .map((r) => ({ id: r.id, label: r.name.toUpperCase() })) || [];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <PageBreadcrumb
        items={[
          {
            label: "User Management",
            icon: Users,
            onClick: () => navigate(-1),
          },
          { label: "Register Staff" },
        ]}
      />
      <div className="max-w-4xl mx-auto">
        <Card className="border-none shadow-md p-0">
          <CardHeader className="flex flex-row items-center gap-2 md:gap-3 border-b p-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="h-8 w-8 text-muted-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <CardTitle className="text-2xl font-bold tracking-tight">
                Register New Staff
              </CardTitle>
              <CardDescription>
                Create a new Professor or HOD account.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-2 sm:p-4 lg:p-6 space-y-8">
            <Alert className="bg-primary/5 border-primary/20 text-primary">
              <Info className="h-4 w-4" />
              <AlertDescription className="ml-2">
                You do not need to set a password. The system will automatically
                generate secure credentials and email them to the user.
              </AlertDescription>
            </Alert>

            <form onSubmit={onSubmit} className="space-y-6 max-w-2xl">
              {/* Identity Group */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b pb-2">
                  Identity Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <FieldLabel>
                      First Name <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Input
                      {...form.register("firstName")}
                      placeholder="Enter first name"
                    />
                    {form.formState.errors.firstName && (
                      <span className="text-xs text-red-500">
                        {form.formState.errors.firstName.message}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <FieldLabel>
                      Last Name <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Input
                      {...form.register("lastName")}
                      placeholder="Enter last name"
                    />
                    {form.formState.errors.lastName && (
                      <span className="text-xs text-red-500">
                        {form.formState.errors.lastName.message}
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <FieldLabel>
                    Email Address <span className="text-red-500">*</span>
                  </FieldLabel>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...form.register("email")}
                      placeholder="staff@university.edu"
                      className="pl-9"
                    />
                  </div>
                  {form.formState.errors.email && (
                    <span className="text-xs text-red-500">
                      {form.formState.errors.email.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Assignment Group */}
              <div className="space-y-0.5 md:space-y-4 pt-1 md:pt-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b pb-2">
                  System Assignment
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4">
                  <div className="space-y-1.5">
                    <FieldLabel>
                      System Role <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Controller
                      name="roleId"
                      control={form.control}
                      render={({ field }) => (
                        <DynamicSelect
                          value={field.value}
                          onChange={field.onChange}
                          options={availableRoles}
                          placeholder="Role"
                          isLoading={isRolesLoading}
                          disabled={isRolesLoading}
                        />
                      )}
                    />
                    {form.formState.errors.roleId && (
                      <p className="text-xs text-red-500">
                        {form.formState.errors.roleId.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <FieldLabel>
                      Assigned Branch <span className="text-red-500">*</span>
                    </FieldLabel>
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
                          disabled={!canSelectBranch || isBranchesLoading}
                        />
                      )}
                    />
                    {form.formState.errors.branchId && (
                      <p className="text-xs text-red-500">
                        {form.formState.errors.branchId.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Professional Details Group */}
              <div className="space-y-0.5 md:space-y-4 pt-1 md:pt-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b pb-2">
                  Professional Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4">
                  <div className="space-y-1.5">
                    <FieldLabel>
                      Designation <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Input
                      {...form.register("designation")}
                      placeholder="e.g., Assistant Professor"
                    />
                    {form.formState.errors.designation && (
                      <span className="text-xs text-red-500">
                        {form.formState.errors.designation.message}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <FieldLabel>
                      Office Location <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Input
                      {...form.register("officeLocation")}
                      placeholder="e.g., Block B, Room 402"
                    />
                    {form.formState.errors.officeLocation && (
                      <span className="text-xs text-red-500">
                        {form.formState.errors.officeLocation.message}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <FieldLabel>Date of Joining</FieldLabel>
                    <Controller
                      name="joiningDate"
                      control={form.control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="date"
                          min={new Date().toISOString().split("T")[0]}
                        />
                      )}
                    />
                    {form.formState.errors.joiningDate && (
                      <span className="text-xs text-red-500">
                        {form.formState.errors.joiningDate.message}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3 md:pt-6 border-t flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <SpinnerCustom />
                  ) : (
                    <UserPlus className="w-4 h-4 mr-2" />
                  )}
                  {isSubmitting ? "Registering..." : "Register Staff"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
