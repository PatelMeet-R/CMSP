import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { FieldLabel } from "@/components/ui/field";
import { UserPen, Save, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

import { useProfileViewModel } from "../viewModel/useProfileViewModel";
import { BranchDropdownMenu } from "@/modules/branch/view/BranchDropdownMenu";
import { EmailVerificationAlert } from "@/components/custom/EmailVerificationAlert";
import { SpinnerCustom } from "@/components/ui/spinner";
import { ProfileRenderField } from "./ProfileRenderField";
import ProfileHeader from "./ProfileHeader";

export const Profile = () => {
  const vm = useProfileViewModel();

  if (vm.isFetchingProfile || !vm.profile) {
    return (
      <div className="w-full max-w-5xl mx-auto space-y-6 pt-10">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-125 w-full rounded-xl" />
      </div>
    );
  }

  //   Helper to handle if the backend returns branch as a string or object
  const branchDisplay =
    typeof vm.profile.branch === "string"
      ? vm.profile.branch
      : (vm.profile.branch as any)?.name || "N/A";

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-12">
      {/*   Updated Verification Alert with required props */}
      {!vm.isEmailVerified && (
        <EmailVerificationAlert
          isOpen={vm.isVerificationAlertOpen}
          onClose={vm.closeVerificationAlert}
        />
      )}

      <Card className="border-none shadow-lg rounded-xl overflow-hidden bg-card">
        {/* Profile Header (Avatar & Summary) */}
        <ProfileHeader user={vm.profile} />

        <CardHeader className="bg-muted/10 border-b flex flex-row items-center justify-between py-4 px-6">
          <div>
            <CardTitle className="text-xl">Personal Information</CardTitle>
            <CardDescription>
              Manage your personal details and contact information.
            </CardDescription>
          </div>

          <div className="flex gap-3">
            {!vm.isEditing ? (
              <Button onClick={() => vm.setIsEditing(true)} variant="outline">
                <UserPen className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={vm.cancelEdit}
                  disabled={vm.isUpdating}
                >
                  <X className="w-4 h-4 mr-2" /> Cancel
                </Button>
                <Button
                  onClick={vm.onSubmit}
                  disabled={vm.isUpdating || !vm.form.formState.isDirty}
                >
                  {vm.isUpdating ? (
                    <>
                      <SpinnerCustom /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" /> Save
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <form className="space-y-8">
            {/* Academic Details Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">
                Academic Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ProfileRenderField
                  name="firstName"
                  label="First Name"
                  form={vm.form}
                  isEditing={vm.isEditing}
                  canEditRestricted={true}
                />
                <ProfileRenderField
                  name="lastName"
                  label="Last Name"
                  form={vm.form}
                  isEditing={vm.isEditing}
                  canEditRestricted={true}
                />
                <ProfileRenderField
                  name="enrollmentNumber"
                  label="Enrollment / Employee ID"
                  isRestricted={true}
                  form={vm.form}
                  isEditing={vm.isEditing}
                  canEditRestricted={vm.canEditRestricted}
                />

                <div className="flex flex-col gap-1.5">
                  <FieldLabel className="text-muted-foreground">
                    Department / Branch
                  </FieldLabel>
                  {!vm.isEditing ? (
                    <div className="h-10 py-2 text-sm font-medium border-b border-transparent">
                      {/*   Safely render branch display */}
                      {branchDisplay}
                    </div>
                  ) : (
                    <BranchDropdownMenu
                      control={vm.form.control}
                      name="branchId"
                      label=""
                      disabled={!vm.canEditRestricted}
                    />
                  )}
                  {vm.isEditing && !vm.canEditRestricted && (
                    <span className="text-[10px] text-muted-foreground mt-1">
                      Locked: Only Administrators can change department routing.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Details Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">
                Contact & Address Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ProfileRenderField
                  name="primaryMobileNumber"
                  label="Mobile Number"
                  form={vm.form}
                  isEditing={vm.isEditing}
                  canEditRestricted={true}
                />
                <ProfileRenderField
                  name="city"
                  label="City"
                  form={vm.form}
                  isEditing={vm.isEditing}
                  canEditRestricted={true}
                />
                <ProfileRenderField
                  name="state"
                  label="State"
                  form={vm.form}
                  isEditing={vm.isEditing}
                  canEditRestricted={true}
                />
                <ProfileRenderField
                  name="country"
                  label="Country"
                  form={vm.form}
                  isEditing={vm.isEditing}
                  canEditRestricted={true}
                />
                <ProfileRenderField
                  name="postalCode"
                  label="Postal Code"
                  form={vm.form}
                  isEditing={vm.isEditing}
                  canEditRestricted={true}
                />
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
