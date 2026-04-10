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

export default function UserManagementView() {
  const vm = useUserManagementViewModel();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const isSuperAdmin = user?.role === ROLES.SUPER_ADMIN;

  const { branches, isLoading: isBranchesLoading } = useBranchViewModel();
  const { enums: genders, isLoading: isGenderLoading } = useEnumViewModel(
    EnumCategory.GENDER,
  );
  const { enums: roles, isLoading: isUserRoleLoading } = useEnumViewModel(
    EnumCategory.USER_ROLE,
  );

  const roleOptions =
    roles?.map((r: EnumValueResponse) => ({
      id: r.id.toString(),
      key: r.key,
    })) || [];
  const branchOptions =
    branches?.map((b: Branch) => ({ id: b.id, label: b.name })) || [];
  const genderOptions =
    genders?.map((g: EnumValueResponse) => ({ id: g.id, label: g.value })) ||
    [];

  // TAB
  useEffect(() => {
    if (roles && roles.length > 0 && !vm.roleId) {
      const studentRole = roles.find((r) => r.key === "STUDENT");
      vm.setRoleId(
        studentRole ? studentRole.id.toString() : roles[0].id.toString(),
      );
    }
  }, [roles, vm.roleId, vm.setRoleId]);

  const selectedRoleObj = roles?.find((r) => r.id.toString() === vm.roleId);
  const isStudentTab = selectedRoleObj?.key === "STUDENT";

  const hasActiveFilters = Boolean(vm.search || vm.branchId || vm.genderId);

  return (
    <div className="w-full max-w-screen-2xl mx-auto">
      <Card className="border-none shadow-md p-0">
        <CardHeader className="pb-1">
          <CardTitle className="text-2xl flex items-center gap-1">
            <Users className="w-6 h-6 text-primary" />
            User Management
          </CardTitle>
          <CardDescription>
            View, manage, and update user roles and statuses across the system.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pb-3">
          {/* --- ROLE TABS --- */}
          <Tabs
            value={vm.roleId}
            onValueChange={vm.setRoleId}
            className="w-full"
          >
            <TabsList className="w-full justify-start overflow-x-auto h-auto flex-wrap sm:flex-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {roleOptions.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.key}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* --- TOOLBAR --- */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end bg-muted/30 p-3 rounded-lg border">
            {/* Search Input */}
            <div className="flex-1 w-full">
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                Search
              </label>
              <DebouncedSearchInput
                value={vm.search}
                onChange={vm.setSearch}
                placeholder="Search by name, enrollment, or city..."
              />
            </div>

            {/* 🚀 FIXED: Wrapped Dropdowns to force Side-by-Side on Mobile/Tablet */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-start sm:items-end">
              <div className="flex flex-row gap-3 w-full sm:w-auto">
                {/* Only show Branch filter if they are a Super Admin */}
                {isSuperAdmin && (
                  <div className="flex-1 sm:w-40 lg:w-44">
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                      Branch
                    </label>
                    <DynamicSelect
                      value={vm.branchId}
                      onChange={vm.setBranchId}
                      options={branchOptions}
                      placeholder="Branch"
                      isLoading={isBranchesLoading}
                    />
                  </div>
                )}

                <div className="flex-1 sm:w-40 lg:w-44">
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                    Gender
                  </label>
                  <DynamicSelect
                    value={vm.genderId}
                    onChange={vm.setGenderId}
                    options={genderOptions}
                    placeholder="Gender"
                    isLoading={isGenderLoading}
                  />
                </div>
              </div>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  className="w-full sm:w-auto text-red-500 hover:text-red-600 hover:bg-red-50 px-3"
                  onClick={vm.clearFilters}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* --- DATA TABLE WRAPPER --- */}
          <div className="mb-0">
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

          {/* --- PAGINATION --- */}
          {vm.meta && vm.meta.totalPages > 1 && (
            <div className="pt-2">
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
