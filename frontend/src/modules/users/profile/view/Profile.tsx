import { Button } from "@/components/ui/button";
import { FieldLabel } from "@/components/ui/field";
import {
  UserPen,
  Save,
  X,
  GraduationCap,
  Phone,

  Loader2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

import { useProfileViewModel } from "../viewModel/useProfileViewModel";
import { BranchDropdownMenu } from "@/modules/branch/view/BranchDropdownMenu";
import { EmailVerificationAlert } from "@/components/custom/EmailVerificationAlert";
import { ProfileRenderField } from "./ProfileRenderField";
import ProfileHeader from "./ProfileHeader";

export const Profile = () => {
  const vm = useProfileViewModel();

  if (vm.isFetchingProfile || !vm.profile) {
    return (
      <div className="w-full max-w-5xl mx-auto space-y-8 py-8">
        <div className="rounded-2xl border overflow-hidden">
          <Skeleton className="h-1.5 w-full" />
          <div className="p-8 flex items-center gap-6">
            <Skeleton className="h-28 w-28 rounded-full" />
            <div className="space-y-3 flex-1">
              <Skeleton className="h-7 w-56" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>
        </div>
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }

  //   Helper to handle if the backend returns branch as a string or object
  const branchDisplay =
    typeof vm.profile.branch === "string"
      ? vm.profile.branch
      : (vm.profile.branch as any)?.name || "N/A";

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-16">
      {/*   Updated Verification Alert with required props */}
      {!vm.isEmailVerified && (
        <EmailVerificationAlert
          isOpen={vm.isVerificationAlertOpen}
          onClose={vm.closeVerificationAlert}
        />
      )}

      {/* ═══════════════════════════════════════
          PROFILE HERO CARD
          ═══════════════════════════════════════ */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
        {/* Profile Header (Avatar & Summary) */}
        <ProfileHeader user={vm.profile} />

        {/* ── Section Header with Actions ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 sm:px-8 py-4 border-t bg-muted/20">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Personal Information
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage your personal details and contact information.
            </p>
          </div>

          <div className="flex gap-2">
            {!vm.isEditing ? (
              <Button
                onClick={() => vm.setIsEditing(true)}
                size="sm"
                variant="outline"
                className="gap-2 border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all"
              >
                <UserPen className="h-4 w-4" />
                <span>Edit Profile</span>
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={vm.cancelEdit}
                  disabled={vm.isUpdating}
                  className="gap-1.5"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={vm.onSubmit}
                  disabled={vm.isUpdating || !vm.form.formState.isDirty}
                  className="gap-1.5"
                >
                  {vm.isUpdating ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  {vm.isUpdating ? "Saving…" : "Save"}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* ── Form Content ── */}
        <div className="px-6 sm:px-8 py-6">
          <form className="space-y-8">
            {/* Academic Details Section */}
            <div className="space-y-5">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" />
                Academic Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 rounded-xl border border-border/50 bg-muted/10 p-5">
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
                  <FieldLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Department / Branch
                  </FieldLabel>
                  {!vm.isEditing ? (
                    <div className="h-10 py-2 text-sm font-medium text-foreground">
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
                    <span className="text-[10px] text-muted-foreground/80 leading-relaxed">
                      Locked: Only Administrators can change department routing.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Details Section */}
            <div className="space-y-5">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                Contact & Address Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 rounded-xl border border-border/50 bg-muted/10 p-5">
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
        </div>
      </div>
    </div>
  );
};
