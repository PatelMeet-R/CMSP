import { useEffect } from "react";
import { Users, XCircle } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { useUserManagementViewModel } from "../viewModel/useUserManagementViewModel";
import { DynamicSelect } from "@/components/custom/dashboard/DynamicSelect";
import { DebouncedSearchInput } from "@/components/custom/dashboard/SearchInput";
import { DataTablePagination } from "@/components/custom/dashboard/DataTablePagination";
import { UsersTable } from "@/modules/users/view/UsersTable";

import type { Branch } from "@/modules/branch/types/branch";
import { useBranchViewModel } from "@/modules/branch/viewModel/useBranchViewModel";
import { useEnumViewModel } from "@/modules/enums/viewModel/useEnumViewModel";
import {
  EnumCategory,
  type EnumValueResponse,
} from "@/modules/enums/types/enum.schemas";

import { useAppSelector } from "@/store/hook";
import { ROLES } from "@/core/Constants/enums/role-enum-value";
import { useNavigate } from "react-router-dom";
import { ROUTENAME } from "@/core/Constants/RouteName";

import { HodProfileModal } from "@/modules/users/view/ModelHodProfile";

export default function UserManagementView() {
  const vm = useUserManagementViewModel();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const currentUserRole = user?.role;
  const isSuperAdmin = currentUserRole === ROLES.SUPER_ADMIN;
  const isHOD = currentUserRole === ROLES.HOD;

  const { branches, isLoading: isBranchesLoading } = useBranchViewModel();
  const { enums: genders, isLoading: isGenderLoading } = useEnumViewModel(
    EnumCategory.GENDER,
  );
  const { enums: roles, isLoading: isUserRoleLoading } = useEnumViewModel(
    EnumCategory.USER_ROLE,
  );

  // ==========================================
  //  DYNAMIC TAB FILTERING LOGIC
  // ==========================================
  const allowedTabKeys: string[] = (() => {
    if (isSuperAdmin) return [ROLES.HOD, ROLES.PROFESSOR, ROLES.STUDENT];
    if (isHOD) return [ROLES.PROFESSOR, ROLES.STUDENT];
    if (currentUserRole === ROLES.PROFESSOR)
      return [ROLES.PROFESSOR, ROLES.STUDENT];
    if (currentUserRole === ROLES.STUDENT) return [ROLES.PROFESSOR];
    return [];
  })();

  const filteredTabs =
    roles
      ?.filter((r: EnumValueResponse) => allowedTabKeys.includes(r.key))
      .map((r: EnumValueResponse) => ({ id: r.id.toString(), key: r.key })) ||
    [];

  // ============
  //  Extract the hodRoleId so we can pass it down to the Modal
  const hodRoleId = roles?.find((r) => r.key === ROLES.HOD)?.id.toString();
  // ============

  useEffect(() => {
    if (filteredTabs.length > 0 && !vm.roleId) {
      vm.setRoleId(filteredTabs[0].id);
    }
  }, [filteredTabs.length, vm.roleId, vm.setRoleId]);

  const branchOptions =
    branches?.map((b: Branch) => ({ id: b.id, label: b.name.toUpperCase() })) ||
    [];
  const genderOptions =
    genders?.map((g: EnumValueResponse) => ({
      id: g.id,
      label: g.value.toUpperCase(),
    })) || [];

  const selectedRoleObj = roles?.find((r) => r.id.toString() === vm.roleId);
  const isStudentTab = selectedRoleObj?.key === ROLES.STUDENT;
  const hasActiveFilters = Boolean(vm.search || vm.branchId || vm.genderId);

  //  Get current user's branch name for the modal
  const currentBranchName = branches?.find(
    (b: Branch) => b.id === user?.branchId,
  )?.name;

  return (
    <div className="w-full max-w-screen-2xl mx-auto space-y-6">
      <Card className="border-none shadow-md p-0">
        <CardHeader className="p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between">
          <div>
            <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              User Management
            </CardTitle>
            <CardDescription>
              {isSuperAdmin
                ? "System-wide overview of all registered roles and departments."
                : "Manage and view members within your designated department."}
            </CardDescription>
          </div>

          {!isSuperAdmin && !isHOD && (
            <HodProfileModal
              branchId={user?.branchId}
              branchName={currentBranchName}
              hodRoleId={hodRoleId}
            />
          )}
        </CardHeader>

        <CardContent className="p-0 sm:p-4 md:p-6 space-y-4">
          <div className="px-4 pt-4 sm:px-0 sm:pt-0">
            <Tabs
              value={vm.roleId || ""}
              onValueChange={vm.setRoleId}
              className="w-full"
            >
              <TabsList className="w-full justify-start overflow-x-auto h-auto flex-wrap sm:flex-nowrap bg-muted/50 p-1 rounded-lg">
                {filteredTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex-1 sm:flex-none min-w-30 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    {tab.key}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <div className="mx-4 sm:mx-0 flex flex-col xl:flex-row gap-4 items-start xl:items-end bg-muted/20 p-4 rounded-xl border">
            <div className="flex-1 w-full min-w-62.5">
              <label className="text-xs font-bold tracking-wider uppercase text-muted-foreground mb-1.5 block">
                Search
              </label>
              <DebouncedSearchInput
                value={vm.search}
                onChange={vm.setSearch}
                placeholder="Search by name, enrollment, or city..."
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto items-start sm:items-end">
              {isSuperAdmin && (
                <div className="w-full sm:w-45">
                  <label className="text-xs font-bold tracking-wider uppercase text-muted-foreground mb-1.5 block">
                    Branch Filter
                  </label>
                  <DynamicSelect
                    value={vm.branchId}
                    onChange={vm.setBranchId}
                    options={branchOptions}
                    placeholder="Branches"
                    isLoading={isBranchesLoading}
                  />
                </div>
              )}

              <div className="w-full sm:w-45">
                <label className="text-xs font-bold tracking-wider uppercase text-muted-foreground mb-1.5 block">
                  Gender Filter
                </label>
                <DynamicSelect
                  value={vm.genderId}
                  onChange={vm.setGenderId}
                  options={genderOptions}
                  placeholder="Genders"
                  isLoading={isGenderLoading}
                />
              </div>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  className="w-full sm:w-auto text-red-500 hover:text-red-600 hover:bg-red-50/50 transition-colors"
                  onClick={vm.clearFilters}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          <div className="px-4 sm:px-0">
            <div className="rounded-md border overflow-hidden">
              <UsersTable
                users={vm.users}
                isLoading={vm.isLoading || isUserRoleLoading}
                isSuperAdmin={isSuperAdmin}
                isStudent={isStudentTab}
                onRowClick={(id) =>
                  navigate(ROUTENAME.USER_DETAILS.replace(":id", id.toString()))
                }
              />
            </div>
          </div>

          {vm.meta && vm.meta.totalPages > 1 && (
            <div className="px-4 pb-4 sm:px-0 sm:pb-0 pt-2">
              <DataTablePagination
                meta={vm.meta}
                onPageChange={vm.setPage}
                onLimitChange={vm.setLimit}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
