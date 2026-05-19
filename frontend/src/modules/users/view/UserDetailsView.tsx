import { useState, useEffect } from "react";
import {
  Users,
  ArrowLeft,
  ShieldCheck,
  UserPen,
  Save,
  X,
  KeyRound,
  History,
  Mail,
  MapPin,
  Phone,
  CalendarDays,
  GraduationCap,
  Building2,
  Fingerprint,

  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldLabel } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// State & Logic
import { useUserDetailsViewModel } from "../viewModel/useUserDetailsViewModel";
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

// 🚨 V2: PBAC Hook
import { usePermissions } from "@/hooks/usePermissions";
import { useRoleViewModel } from "@/modules/roles/viewModel/useRoleViewModel";
import PermissionAuditLogView from "@/modules/users/view/PermissionAuditLogView";

// ─────────────────────────────────────────────
//  Status Badge Styling
// ─────────────────────────────────────────────
function getStatusStyles(status: string | undefined) {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800";
    case "BLOCKED":
    case "SUSPENDED":
      return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800";
    default:
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800";
  }
}

// ─────────────────────────────────────────────
//  Inline Detail Row (read-only view)
// ─────────────────────────────────────────────
function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | undefined | null;
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/60 dark:bg-muted/30">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="text-sm font-medium text-foreground truncate">
          {value || "—"}
        </span>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════
//  MAIN COMPONENT
// ═════════════════════════════════════════════
export default function UserDetailsView() {
  const vm = useUserDetailsViewModel();

  // 🚨 V2 PBAC: Capability Slugs
  const { hasPermission } = usePermissions();
  const canManageGlobal = hasPermission("user:manage-global");
  const canUpdateRestricted =
    hasPermission("user:update-restricted") || canManageGlobal;
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
  const { roles, isRolesLoading } = useRoleViewModel();

  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");

  const currentStatus =
    typeof profile?.accountStatus === "string"
      ? profile.accountStatus
      : profile?.accountStatus?.key;

  const profileRoleString =
    typeof profile?.role === "string" ? profile.role : profile?.role?.name;

  const currentRoleMatch = roles?.find(
    (r) => r.name === profileRoleString || r.id === profile?.roleId,
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

  // ─────────────────────────────────────────
  //  SKELETON LOADER
  // ─────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto space-y-8 py-6">
        <Skeleton className="h-5 w-56" />
        <div className="rounded-2xl border bg-card p-8 space-y-6">
          <div className="flex items-center gap-5">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2.5 flex-1">
              <Skeleton className="h-6 w-52" />
              <Skeleton className="h-4 w-36" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!profile)
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
        <Users className="h-12 w-12 opacity-30" />
        <p className="text-sm font-medium">User not found.</p>
      </div>
    );

  const isStudent = profileRoleString === "STUDENT";
  const isStaff = !isStudent;

  const breadcrumbLabel =
    isStudent && profile.enrollmentNumber !== "NOT_REQUIRED"
      ? profile.enrollmentNumber
      : profile.fullName;

  const hasPendingModalChanges =
    selectedStatus !== currentStatus || selectedRole !== currentRoleId;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-16">
      {/* ── BREADCRUMB ── */}
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

      {/* ═══════════════════════════════════════
          PROFILE HERO CARD
          ═══════════════════════════════════════ */}
      <div className="relative rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
        {/* Decorative gradient bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-primary/70 to-primary/40" />

        <div className="p-6 sm:p-8">
          {/* Top: Back button + Actions */}
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>

            {canUpdateRestricted && (
              <div className="flex items-center gap-2">
                {/* SYSTEM ACTIONS MODAL */}
                <Dialog open={actionModalOpen} onOpenChange={setActionModalOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      <span className="hidden sm:inline">System Actions</span>
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl">
                    <div className="px-6 pt-6 pb-4 border-b bg-muted/30">
                      <DialogTitle className="text-lg font-semibold">
                        System Actions
                      </DialogTitle>
                      <DialogDescription className="mt-1 text-sm">
                        Modify system access and account status for{" "}
                        <span className="font-semibold text-foreground">
                          {profile.fullName}
                        </span>
                        .
                      </DialogDescription>
                    </div>

                    <div className="px-6 py-5 space-y-5">
                      <div className="space-y-2">
                        <FieldLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          ACCOUNT STATUS
                        </FieldLabel>
                        <Select
                          disabled={isUpdating || isStatusLoading}
                          value={selectedStatus}
                          onValueChange={setSelectedStatus}
                        >
                          <SelectTrigger className="h-10 bg-background shadow-sm rounded-lg">
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
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          Determines if the user can log in to the platform.
                        </p>
                      </div>

                      {canManageGlobal && (
                        <div className="space-y-2">
                          <FieldLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            SYSTEM ROLE
                          </FieldLabel>
                          <Select
                            disabled={isUpdating || isRolesLoading}
                            value={selectedRole}
                            onValueChange={setSelectedRole}
                          >
                            <SelectTrigger className="h-10 bg-background shadow-sm rounded-lg">
                              <SelectValue placeholder="Select Role" />
                            </SelectTrigger>
                            <SelectContent>
                              {/* 🚨 FIX: changed role.key to role.name */}
                              {roles?.map((role) => (
                                <SelectItem
                                  key={role.id}
                                  value={role.id.toString()}
                                >
                                  {role.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            Controls default base access and administrative
                            privileges.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="px-6 py-4 border-t bg-muted/20 flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActionModalOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveSystemActions}
                        disabled={isUpdating || !hasPendingModalChanges}
                        className="gap-2"
                      >
                        {isUpdating && (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        )}
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
                    className="gap-2"
                  >
                    <UserPen className="h-4 w-4" />
                    <span className="hidden sm:inline">Edit Details</span>
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isUpdatingDetails}
                      onClick={() => {
                        form.reset();
                        setIsEditing(false);
                      }}
                      className="gap-1.5"
                    >
                      <X className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Cancel</span>
                    </Button>
                    <Button
                      size="sm"
                      onClick={onSubmitDetails}
                      disabled={isUpdatingDetails || !isDirty}
                      className="gap-1.5"
                    >
                      {isUpdatingDetails ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Save className="h-3.5 w-3.5" />
                      )}
                      <span>{isUpdatingDetails ? "Saving…" : "Save"}</span>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Profile Identity ── */}
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar className="h-18 w-18 border-2 border-background shadow-md ring-2 ring-border/30 shrink-0">
              <AvatarImage
                src={profile.profileImageUrl || undefined}
                className="object-cover"
              />
              <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
                {profile.firstName?.[0]}
                {profile.lastName?.[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    {profile.fullName}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    {profile.email || "No email"}
                  </p>
                </div>

                <Badge
                  variant="outline"
                  className={`shrink-0 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider transition-colors ${getStatusStyles(currentStatus)}`}
                >
                  {currentStatus || "Unknown"}
                </Badge>
              </div>

              {/* Quick Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="secondary"
                  className="text-xs font-medium px-2.5 py-0.5"
                >
                  {profileRoleString || "Student"}
                </Badge>
                {profile.branch && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-background px-2.5 py-0.5 font-medium"
                  >
                    <Building2 className="h-3 w-3 mr-1 opacity-60" />
                    {profile.branch}
                  </Badge>
                )}
                {isStudent &&
                  profile.enrollmentNumber !== "NOT_REQUIRED" && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-background font-mono px-2.5 py-0.5"
                    >
                      <Fingerprint className="h-3 w-3 mr-1 opacity-60" />
                      {profile.enrollmentNumber}
                    </Badge>
                  )}
              </div>
            </div>
          </div>

          {/* ── Quick Stats Row (Bento-style) ── */}
          {!isEditing && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-8">
              <DetailRow
                icon={Phone}
                label="Primary Mobile"
                value={profile.primaryMobileNumber}
              />
              <DetailRow
                icon={Phone}
                label="Secondary Mobile"
                value={profile.secondaryMobileNumber}
              />
              <DetailRow
                icon={MapPin}
                label="City"
                value={profile.address?.city}
              />
              <DetailRow
                icon={MapPin}
                label="State"
                value={profile.address?.state}
              />
              <DetailRow
                icon={CalendarDays}
                label="Joined Year"
                value={profile.joinedYear}
              />
              <DetailRow
                icon={GraduationCap}
                label="Grad Year"
                value={profile.gradYear}
              />
              <DetailRow
                icon={Users}
                label="Gender"
                value={profile.gender?.toLowerCase()}
              />
              {canManageGlobal && (
                <DetailRow
                  icon={Building2}
                  label="Assigned Branch"
                  value={profile.branch}
                />
              )}
            </div>
          )}

          {/* ── Edit Mode Form ── */}
          {isEditing && (
            <form className="mt-8 space-y-6">
              <div className="rounded-xl border border-border/50 bg-muted/20 p-5 sm:p-6">
                <h3 className="text-sm font-semibold text-foreground mb-5 flex items-center gap-2">
                  <UserPen className="h-4 w-4 text-primary" />
                  Edit Profile Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
                  {/* 🚨 FIX: Replaced isAdmin with canEditRestricted */}
                  <ProfileRenderField
                    name="firstName"
                    label="FIRST NAME"
                    isRestricted={true}
                    form={form}
                    isEditing={isEditing}
                    canEditRestricted={canUpdateRestricted}
                  />
                  <ProfileRenderField
                    name="lastName"
                    label="LAST NAME"
                    isRestricted={true}
                    form={form}
                    isEditing={isEditing}
                    canEditRestricted={canUpdateRestricted}
                  />
                  <ProfileRenderField
                    name="enrollmentNumber"
                    label="ENROLLMENT NUMBER"
                    isRestricted={true}
                    form={form}
                    isEditing={isEditing}
                    canEditRestricted={canUpdateRestricted}
                  />

                  {canManageGlobal && (
                    <div className="flex flex-col gap-1.5">
                      <BranchDropdownMenu
                        control={form.control}
                        name="branchId"
                        disabled={!canManageGlobal}
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <EnumDropdownMenu
                      control={form.control}
                      name="joinedAcademicYearId"
                      label="Joined Year"
                      category={EnumCategory.ACADEMIC_YEAR}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <EnumDropdownMenu
                      control={form.control}
                      name="expectedGraduateYearId"
                      label="Graduation Year"
                      category={EnumCategory.ACADEMIC_YEAR}
                      disabled={!canUpdateRestricted}
                    />
                  </div>

                  <ProfileRenderField
                    name="primaryMobileNumber"
                    label="PRIMARY MOBILE"
                    isRestricted={false}
                    form={form}
                    isEditing={isEditing}
                    canEditRestricted={canUpdateRestricted}
                  />
                  <ProfileRenderField
                    name="secondaryMobileNumber"
                    label="SEC. MOBILE"
                    isRestricted={false}
                    form={form}
                    isEditing={isEditing}
                    canEditRestricted={canUpdateRestricted}
                  />
                  <ProfileRenderField
                    name="city"
                    label="CITY"
                    isRestricted={false}
                    form={form}
                    isEditing={isEditing}
                    canEditRestricted={canUpdateRestricted}
                  />
                  <ProfileRenderField
                    name="state"
                    label="STATE"
                    isRestricted={false}
                    form={form}
                    isEditing={isEditing}
                    canEditRestricted={canUpdateRestricted}
                  />
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════
          TABBED CONTENT AREA
          ═══════════════════════════════════════ */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList
          variant="line"
          className="w-full justify-start border-b px-0 gap-1"
        >
          <TabsTrigger
            value="details"
            className="text-sm px-4 py-2.5 gap-1.5 transition-colors"
          >
            <UserPen className="h-4 w-4" />
            Details
          </TabsTrigger>
          {canManagePermissions && (
            <TabsTrigger
              value="permissions"
              className="text-sm px-4 py-2.5 gap-1.5 transition-colors"
            >
              <KeyRound className="h-4 w-4" />
              Permissions
            </TabsTrigger>
          )}
          {canManagePermissions && (
            <TabsTrigger
              value="audit"
              className="text-sm px-4 py-2.5 gap-1.5 transition-colors"
            >
              <History className="h-4 w-4" />
              Audit Trail
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="details" className="mt-6">
          {isStaff && (
            <StaffProfessionalDetails
              staffProfile={staffProfile}
              historyMap={historyMap}
              expandedYearKey={expandedYearKey}
              setExpandedYearKey={setExpandedYearKey}
            />
          )}
          {!isStaff && (
            <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-border/50 bg-muted/20">
              <Users className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground font-medium">
                No additional details available for this user type.
              </p>
            </div>
          )}
        </TabsContent>

        {canManagePermissions && (
          <TabsContent value="permissions" className="mt-6">
            <div className="rounded-2xl border border-border/50 bg-card p-5 sm:p-6">
              <UserPermissionMatrix
                personalInfoId={profile.id?.toString() || ""}
              />
            </div>
          </TabsContent>
        )}
        {canManagePermissions && (
          <TabsContent value="audit" className="mt-6">
            <PermissionAuditLogView
              targetUserId={profile.id?.toString() || ""}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
