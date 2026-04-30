import { ShieldAlert, Users, Shield } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRolesManagementViewModel } from "../viewModel/useRolesManagementViewModel";
import { RoleSettingsModal } from "./RoleSettingsModal";

export default function RolesManagementView() {
  const vm = useRolesManagementViewModel();

  if (!vm.canManageRoles) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground gap-4">
        <ShieldAlert className="w-16 h-16 opacity-20" />
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-sm">You do not have permission to manage roles.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Role Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View system roles and configure global base permissions.
          </p>
        </div>
      </div>

      {/* Main Content */}
      {vm.isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      ) : vm.isError ? (
        <div className="text-center py-12 text-destructive border rounded-xl bg-destructive/5">
          <ShieldAlert className="w-10 h-10 mx-auto mb-3 opacity-80" />
          <p className="font-medium">Failed to load roles. Please try again.</p>
        </div>
      ) : (
        <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 font-semibold">Role Name</th>
                  <th className="px-6 py-4 font-semibold">System ID</th>
                  <th className="px-6 py-4 font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {vm.roles.map((role) => (
                  <tr
                    key={role.id}
                    className="hover:bg-muted/10 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-medium text-foreground">
                        <Users className="w-4 h-4 text-primary/70" />
                        {role.name.replace(/_/g, " ")}{" "}
                        {/* Formats SUPER_ADMIN to SUPER ADMIN */}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                      {role.id}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/*  Modal! */}
                      <RoleSettingsModal
                        roleId={role.id}
                        roleName={role.name}
                      />
                    </td>
                  </tr>
                ))}

                {vm.roles.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-8 text-center text-muted-foreground"
                    >
                      No roles found in the system.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
