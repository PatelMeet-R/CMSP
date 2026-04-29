import { useState, useEffect } from "react";
import {
  Users,
  ArrowLeft,
  ShieldCheck,
  UserPen,
  Save,
  X,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldLabel } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { SpinnerCustom } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// State & Logic
import { useUserDetailsViewModel } from "../viewModel/useUserDetailsViewModel";
import { useAppSelector } from "@/store/hook";
import { ROLES } from "@/core/Constants/enums/role-enum-value";
import { EnumCategory } from "@/modules/enums/types/enum.schemas";

// Custom Components
import { PageBreadcrumb } from "@/components/custom/dashboard/PageBreadcrumb";
import { EnumDropdownMenu } from "@/components/custom/EnumDropdownMenu";
import { BranchDropdownMenu } from "@/modules/branch/view/BranchDropdownMenu";
import { useEnumViewModel } from "@/modules/enums/viewModel/useEnumViewModel";
import { ProfileRenderField } from "@/modules/users/profile/view/ProfileRenderField";
import { StaffProfessionalDetails } from "@/modules/users/view/StaffProfessionalDetails";
import UserPermissionMatrix from "@/modules/users/view/UserPermissionMatrix";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePermissions } from "@/hooks/usePermissions";

export default function UserDetailsView() {
  const vm = useUserDetailsViewModel();
  const { user: currentUser } = useAppSelector((state) => state.auth);

  const isSuperAdmin = currentUser?.role === ROLES.SUPER_ADMIN;
  const isHOD = currentUser?.role === ROLES.HOD;
  const isAdmin = isSuperAdmin || isHOD;
  const { hasPermission } = usePermissions();
  const canManagePermissions = hasPermission("user:manage-permissions");

  const {
    userProfile: profile,
    staffProfile,
    historyMap,
    expandedYearKey,
    setExpandedYearKey,
    isLoading,
    navigate,
    form,
    isEditing,
    setIsEditing,
    isDirty,
    isUpdatingDetails,
    onSubmitDetails,
    updateStatus,
    updateRole,
    isUpdating,
  } = vm;

  const { enums: accountStatuses, isLoading: isStatusLoading } =
    useEnumViewModel(EnumCategory.ACCOUNT_STATUS);
  const { enums: roles, isLoading: isRolesLoading } = useEnumViewModel(
    EnumCategory.USER_ROLE,
  );

  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");

  const currentStatus =
    typeof profile?.accountStatus === "string"
      ? profile.accountStatus
      : profile?.accountStatus?.key;
  const currentRoleMatch = roles?.find(
    (r) =>
      r.key === profile?.role ||
      r.value === profile?.role ||
      r.id === profile?.roleId,
  );
  const currentRoleId = currentRoleMatch?.id?.toString() || "";

  // Sync Modal state when opened
  useEffect(() => {
    if (actionModalOpen) {
      setSelectedStatus(currentStatus || "");
      setSelectedRole(currentRoleId || "");
    }
  }, [actionModalOpen, currentStatus, currentRoleId]);

  const handleSaveSystemActions = () => {
    if (selectedStatus !== currentStatus) updateStatus(selectedStatus);
    if (selectedRole !== currentRoleId) updateRole(selectedRole);
    setActionModalOpen(false);
  };

  // --- SKELETON LOADER ---
  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <div className="pt-4">
          <Skeleton className="h-5 w-64 mb-2" />
        </div>
        <Card className="border-none shadow-md p-0">
          <CardHeader className="flex flex-row items-center gap-4 pb-4">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-100 w-full rounded-xl" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile)
    return (
      <div className="text-center p-8 text-muted-foreground">
        User not found.
      </div>
    );

  const isStudent =
    profile.role === "STUDENT" || profile.role?.key === "STUDENT";
  const isStaff =
    profile.role === "PROFESSOR" ||
    profile.role === "HOD" ||
    profile.role?.key === "PROFESSOR" ||
    profile.role?.key === "HOD";

  const breadcrumbLabel =
    isStudent && profile.enrollmentNumber !== "NOT_REQUIRED"
      ? profile.enrollmentNumber
      : profile.fullName;

  const hasPendingModalChanges =
    selectedStatus !== currentStatus || selectedRole !== currentRoleId;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* --- BREADCRUMB --- */}
      <PageBreadcrumb
        items={[
          {
            label: "User Management",
            icon: Users,
            onClick: () => navigate(-1),
          },
          { label: breadcrumbLabel || "User Details", isLoading },
        ]}
      />

      <Card className="border-none shadow-md p-0">
        {/* --- HEADER --- */}
        <CardHeader className="flex flex-row flex-wrap items-center justify-between p-4 sm:p-6 gap-4 border-b">
          <div className="flex flex-row gap-3 items-start min-w-50">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="mt-0.5 h-8 w-8 shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex flex-col gap-1">
              <CardTitle className="text-2xl font-bold tracking-tight">
                User Identity
              </CardTitle>
              <span className="text-sm font-medium text-muted-foreground">
                {isStudent && profile.enrollmentNumber !== "NOT_REQUIRED"
                  ? `${profile.enrollmentNumber}`
                  : `Role: ${profile.role?.value || profile.role}`}
              </span>
            </div>
          </div>

          {isAdmin && (
            <div className="flex flex-row w-full sm:w-auto gap-2 justify-end">
              {/* ACTIONS MODAL */}
              <Dialog open={actionModalOpen} onOpenChange={setActionModalOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 sm:flex-none h-9 border-primary/20 text-primary hover:bg-primary/5"
                  >
                    <ShieldCheck className="w-4 h-4 sm:mr-2" />
                    <span className="truncate">System Actions</span>
                  </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-106.25 p-0 overflow-hidden">
                  <div className="px-6 pt-6 pb-4 border-b">
                    <DialogTitle className="text-xl">
                      System Actions
                    </DialogTitle>
                    <DialogDescription className="mt-1.5">
                      Modify system access and account status for{" "}
                      <span className="font-semibold text-foreground">
                        {profile.fullName}
                      </span>
                      .
                    </DialogDescription>
                  </div>

                  <div className="px-4 md:px-6 bg-muted/10 space-y-6">
                    <div className="space-y-2.5">
                      <FieldLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        ACCOUNT STATUS
                      </FieldLabel>
                      <Select
                        disabled={isUpdating || isStatusLoading}
                        value={selectedStatus}
                        onValueChange={setSelectedStatus}
                      >
                        <SelectTrigger className="h-10 bg-background shadow-sm">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                          {accountStatuses?.map((status) => (
                            <SelectItem key={status.id} value={status.key}>
                              {status.value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-[11px] text-muted-foreground">
                        Determines if the user can log in to the platform.
                      </span>
                    </div>

                    {isSuperAdmin && (
                      <div className="space-y-2.5">
                        <FieldLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          SYSTEM ROLE
                        </FieldLabel>
                        <Select
                          disabled={isUpdating || isRolesLoading}
                          value={selectedRole}
                          onValueChange={setSelectedRole}
                        >
                          <SelectTrigger className="h-10 bg-background shadow-sm">
                            <SelectValue placeholder="Select Role" />
                          </SelectTrigger>
                          <SelectContent>
                            {roles?.map((role) => (
                              <SelectItem
                                key={role.id}
                                value={role.id.toString()}
                              >
                                {role.key}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="text-[11px] text-muted-foreground">
                          Controls data access and administrative privileges.
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="px-6 py-4 border-t bg-muted/20 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setActionModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveSystemActions}
                      disabled={isUpdating || !hasPendingModalChanges}
                    >
                      {isUpdating ? <SpinnerCustom /> : null}
                      Save Changes
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* EDIT DETAILS BUTTONS */}
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  size="sm"
                  className="flex-1 sm:flex-none h-9"
                >
                  <UserPen className="w-4 h-4 sm:mr-2" />
                  <span className="truncate">Edit Details</span>
                </Button>
              ) : (
                <div className="flex flex-row gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 sm:flex-none h-9"
                    disabled={isUpdatingDetails}
                    onClick={() => {
                      form.reset();
                      setIsEditing(false);
                    }}
                  >
                    <X className="w-4 h-4 sm:mr-1" />{" "}
                    <span className="hidden sm:inline">Cancel</span>
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 sm:flex-none h-9"
                    onClick={onSubmitDetails}
                    disabled={isUpdatingDetails || !isDirty}
                  >
                    {isUpdatingDetails ? (
                      <SpinnerCustom />
                    ) : (
                      <Save className="w-4 h-4 sm:mr-1" />
                    )}
                    <span className="truncate">
                      {isUpdatingDetails ? "Saving" : "Save"}
                    </span>
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardHeader>

        {/* --- MAIN CONTENT GRID --- */}
        <CardContent className="p-4 sm:p-6">
          <div className="bg-muted/10 p-5 md:p-6 rounded-xl border space-y-6">
            {/* User Summary Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-border/50">
              <div className="flex items-center gap-4 w-full">
                <Avatar className="h-12 w-12 sm:h-14 sm:w-14 border border-background shadow-sm shrink-0">
                  <AvatarImage
                    src={profile.profileImageUrl || undefined}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-lg bg-primary/10 text-primary font-semibold">
                    {profile.firstName?.[0]}
                    {profile.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1.5 w-full">
                  <div className="flex items-start justify-between w-full">
                    <span className="text-sm font-semibold text-foreground/90 uppercase tracking-wider truncate">
                      {profile.fullName}
                    </span>
                    <Badge
                      variant="outline"
                      className={`shrink-0 px-2 py-0.5 text-[10px] sm:text-xs uppercase tracking-wider ${
                        currentStatus === "ACTIVE"
                          ? "text-green-600 border-green-600 bg-green-50"
                          : currentStatus === "BLOCKED" ||
                              currentStatus === "SUSPENDED"
                            ? "text-red-600 border-red-600 bg-red-50"
                            : "text-orange-600 border-orange-600 bg-orange-50"
                      }`}
                    >
                      {currentStatus || "Unknown"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="text-[10px] sm:text-xs px-2 py-0"
                    >
                      {profile.role?.value || profile.role || "Student"}
                    </Badge>
                    {profile.branch && (
                      <Badge
                        variant="outline"
                        className="text-[10px] sm:text-xs bg-background px-2 py-0"
                      >
                        {profile.branch}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Semantic Form */}
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6">
                <div className="grid grid-cols-2 gap-4 col-span-1 md:col-span-2 lg:col-span-1">
                  <ProfileRenderField
                    name="firstName"
                    label="FIRST NAME"
                    isRestricted={true}
                    form={form}
                    isEditing={isEditing}
                    isAdmin={isAdmin}
                  />
                  <ProfileRenderField
                    name="lastName"
                    label="LAST NAME"
                    isRestricted={true}
                    form={form}
                    isEditing={isEditing}
                    isAdmin={isAdmin}
                  />
                </div>

                <ProfileRenderField
                  name="enrollmentNumber"
                  label="ENROLLMENT NUMBER"
                  isRestricted={true}
                  form={form}
                  isEditing={isEditing}
                  isAdmin={isAdmin}
                />

                {isSuperAdmin && (
                  <div className="flex flex-col gap-1.5">
                    {!isEditing ? (
                      <>
                        <FieldLabel className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                          ASSIGNED BRANCH
                        </FieldLabel>
                        <div className="h-9 py-1.5 text-sm font-semibold text-foreground">
                          {profile?.branch || "—"}
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
                )}

                <div className="grid grid-cols-2 gap-4 col-span-1 md:col-span-2 lg:col-span-1">
                  <div className="flex flex-col gap-1.5">
                    {!isEditing ? (
                      <>
                        <FieldLabel className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                          JOINED YEAR
                        </FieldLabel>
                        <div className="h-9 py-1.5 text-sm font-semibold text-foreground">
                          {profile?.joinedYear || "—"}
                        </div>
                      </>
                    ) : (
                      <EnumDropdownMenu
                        control={form.control}
                        name="joinedAcademicYearId"
                        label="Joined Year"
                        category={EnumCategory.ACADEMIC_YEAR}
                      />
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {!isEditing ? (
                      <>
                        <FieldLabel className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                          GRAD. YEAR
                        </FieldLabel>
                        <div className="h-9 py-1.5 text-sm font-semibold text-foreground">
                          {profile?.gradYear || "—"}
                        </div>
                      </>
                    ) : (
                      <EnumDropdownMenu
                        control={form.control}
                        name="expectedGraduateYearId"
                        label="Graduation Year"
                        category={EnumCategory.ACADEMIC_YEAR}
                        disabled={!isAdmin}
                      />
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <FieldLabel className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    GENDER
                  </FieldLabel>
                  <div className="h-9 py-1.5 text-sm font-semibold text-foreground capitalize">
                    {profile?.gender?.toLowerCase() || "—"}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 col-span-1 md:col-span-2 lg:col-span-1">
                  <ProfileRenderField
                    name="primaryMobileNumber"
                    label="PRIMARY MOBILE"
                    isRestricted={false}
                    form={form}
                    isEditing={false}
                    isAdmin={isAdmin}
                  />
                  <ProfileRenderField
                    name="secondaryMobileNumber"
                    label="SEC. MOBILE"
                    isRestricted={false}
                    form={form}
                    isEditing={false}
                    isAdmin={isAdmin}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 col-span-1 md:col-span-2 lg:col-span-1">
                  <ProfileRenderField
                    name="city"
                    label="CITY"
                    isRestricted={false}
                    form={form}
                    isEditing={false}
                    isAdmin={isAdmin}
                  />
                  <ProfileRenderField
                    name="state"
                    label="STATE"
                    isRestricted={false}
                    form={form}
                    isEditing={false}
                    isAdmin={isAdmin}
                  />
                </div>
              </div>
              {/* ============= */}
            </form>
          </div>
        </CardContent>
      </Card>

      {/* --- TABS: PROFESSIONAL INFO & PERMISSIONS --- */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList variant="line" className="w-full justify-start border-b px-0 gap-0">
          <TabsTrigger value="details" className="text-sm px-4 py-2">
            <UserPen className="w-4 h-4 mr-1.5" />
            Details
          </TabsTrigger>
          {canManagePermissions && (
            <TabsTrigger value="permissions" className="text-sm px-4 py-2">
              <KeyRound className="w-4 h-4 mr-1.5" />
              Permissions
            </TabsTrigger>
          )}
        </TabsList>

        {/* Tab 1: Staff Professional Details (existing) */}
        <TabsContent value="details" className="mt-4">
          {isStaff && (
            <StaffProfessionalDetails
              staffProfile={staffProfile}
              historyMap={historyMap}
              expandedYearKey={expandedYearKey}
              setExpandedYearKey={setExpandedYearKey}
            />
          )}
          {!isStaff && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No additional details available for this user type.
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Permission Matrix */}
        {canManagePermissions && (
          <TabsContent value="permissions" className="mt-4">
            <Card className="border-none shadow-md">
              <CardContent className="p-4 sm:p-6">
                <UserPermissionMatrix
                  personalInfoId={profile.id?.toString() || ""}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
