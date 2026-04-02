import { useState } from "react";
import { useAppSelector } from "@/store/hook";
import { ROLES } from "@/core/Constants/enums/role-enum-value";

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

import { useProfileViewModel } from "../viewModel/useProfileViewModel";
import { BranchDropdownMenu } from "@/modules/branch/view/BranchDropdownMenu";

import type { UpdateProfileFormValues } from "@/modules/profile/types/profile.schema";
import { EmailVerificationAlert } from "@/components/custom/EmailVerificationAlert";
import { EnumDropdownMenu } from "@/components/custom/EnumDropdownMenu";
import { EnumCategory } from "@/modules/enums/types/enum.schemas";

// Import the newly separated Field component
import { ProfileRenderField } from "./ProfileRenderField";
import { toastService } from "@/core/toast/toastService";
import { SpinnerCustom } from "@/components/ui/spinner";

export const Profile = () => {
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.role === ROLES.SUPER_ADMIN || user?.role === ROLES.HOD;

  const [isEditing, setIsEditing] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const { form, profile, isFetchingProfile, isUpdating, onSubmit } =
    useProfileViewModel();
  const { isDirty } = form.formState;

  if (isFetchingProfile) {
    return (
      <div className="grid place-items-center h-screen">
        <SpinnerCustom />
      </div>
    );
  }

  const handleSubmitAndClose = (data: UpdateProfileFormValues) => {
    onSubmit(data);
    setIsEditing(false);
  };

  const handleEditClick = () => {
    if (!user?.isEmailVerified) {
      setShowVerifyModal(true);
    } else {
      setIsEditing(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* THE VERIFICATION MODAL */}
      <EmailVerificationAlert
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Personal Profile</CardTitle>
            <CardDescription>
              View and manage your account details.
            </CardDescription>
          </div>

          <div className="flex gap-2">
            {!isEditing ? (
              <Button onClick={handleEditClick}>
                <UserPen className="w-4 h-4 mr-2" /> Edit Profile
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    form.reset();
                    setIsEditing(false);
                  }}
                  disabled={isUpdating}
                >
                  <X className="w-4 h-4 mr-2" /> Cancel
                </Button>
                <Button
                  onClick={form.handleSubmit(
                    handleSubmitAndClose, // The success function
                    (errors) => {
                      console.log(" ZOD VALIDATION BLOCKED THE SUBMIT!");
                      console.log("Errors:", errors);
                      toastService.error(
                        "Please fix the errors in the form before saving.",
                      );
                    },
                  )}
                  disabled={isUpdating || !isDirty}
                >
                  {isUpdating ? (
                    <SpinnerCustom />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
              </>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <form>
            {/* --- IDENTITY --- */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                Personal Identity
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ProfileRenderField
                  name="firstName"
                  label="First Name"
                  isRestricted={true}
                  form={form}
                  isEditing={isEditing}
                  isAdmin={isAdmin}
                />
                <ProfileRenderField
                  name="lastName"
                  label="Last Name"
                  isRestricted={true}
                  form={form}
                  isEditing={isEditing}
                  isAdmin={isAdmin}
                />

                <div className="flex flex-col gap-1.5">
                  {!isEditing ? (
                    <>
                      <FieldLabel className="text-muted-foreground">
                        Gender
                      </FieldLabel>
                      <div className="h-10 py-2 text-sm font-medium border-b border-transparent">
                        {profile?.gender || "Not specified"}
                      </div>
                    </>
                  ) : (
                    <EnumDropdownMenu
                      control={form.control}
                      name="genderId"
                      label="Gender"
                      category={EnumCategory.GENDER}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* --- ACADEMIC DETAILS --- */}
            <div className="space-y-4 mt-8">
              <h3 className="text-lg font-semibold border-b pb-2">
                Academic Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ProfileRenderField
                  name="enrollmentNumber"
                  label="Enrollment Number"
                  isRestricted={true}
                  form={form}
                  isEditing={isEditing}
                  isAdmin={isAdmin}
                />

                <div className="flex flex-col gap-1.5">
                  {!isEditing ? (
                    <>
                      <FieldLabel className="text-muted-foreground">
                        Branch
                      </FieldLabel>
                      <div className="h-10 py-2 text-sm font-medium border-b border-transparent">
                        {profile?.branch || "No Branch Assigned"}
                      </div>
                    </>
                  ) : (
                    <BranchDropdownMenu
                      control={form.control}
                      name="branchId"
                      disabled={!isAdmin}
                    />
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  {!isEditing ? (
                    <>
                      <FieldLabel className="text-muted-foreground">
                        Joined Year
                      </FieldLabel>
                      <div className="h-10 py-2 text-sm font-medium border-b border-transparent">
                        {profile?.joinedYear || "Not specified"}
                      </div>
                    </>
                  ) : (
                    <EnumDropdownMenu
                      control={form.control}
                      name="joinedAcademicYearId"
                      label="Joined Year"
                      category={EnumCategory.ACADEMIC_YEAR}
                      // disabled={!isAdmin}
                    />
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  {!isEditing ? (
                    <>
                      <FieldLabel className="text-muted-foreground">
                        Expected Graduation
                      </FieldLabel>
                      <div className="h-10 py-2 text-sm font-medium border-b border-transparent">
                        {profile?.expectedGraduationYear || "Not specified"}
                      </div>
                    </>
                  ) : (
                    <EnumDropdownMenu
                      control={form.control}
                      name="expectedGraduateYearId"
                      label="Expected Graduation"
                      category={EnumCategory.ACADEMIC_YEAR}
                      disabled={!isAdmin}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* --- CONTACT INFORMATION --- */}
            <div className="space-y-4 mt-8">
              <h3 className="text-lg font-semibold border-b pb-2">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ProfileRenderField
                  name="primaryMobileNumber"
                  label="Primary Mobile"
                  isRestricted={false}
                  form={form}
                  isEditing={isEditing}
                  isAdmin={isAdmin}
                />
                <ProfileRenderField
                  name="secondaryMobileNumber"
                  label="Secondary Mobile"
                  isRestricted={false}
                  form={form}
                  isEditing={isEditing}
                  isAdmin={isAdmin}
                />
              </div>
            </div>

            {/* --- ADDRESS --- */}
            <div className="space-y-4 mt-8">
              <h3 className="text-lg font-semibold border-b pb-2">
                Address Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ProfileRenderField
                  name="city"
                  label="City"
                  isRestricted={false}
                  form={form}
                  isEditing={isEditing}
                  isAdmin={isAdmin}
                />
                <ProfileRenderField
                  name="state"
                  label="State"
                  isRestricted={false}
                  form={form}
                  isEditing={isEditing}
                  isAdmin={isAdmin}
                />
                <ProfileRenderField
                  name="country"
                  label="Country"
                  isRestricted={false}
                  form={form}
                  isEditing={isEditing}
                  isAdmin={isAdmin}
                />
                <ProfileRenderField
                  name="postalCode"
                  label="Postal Code"
                  isRestricted={false}
                  form={form}
                  isEditing={isEditing}
                  isAdmin={isAdmin}
                />
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
