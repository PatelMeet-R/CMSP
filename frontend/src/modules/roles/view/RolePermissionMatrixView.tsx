import { Shield, Search, Save, AlertTriangle, ShieldCheck } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useRolePermissionViewModel } from "../viewModel/useRolePermissionViewModel";
import { formatAction, formatResource } from "@/lib/permission.utils";

interface Props {
  roleId: string;
}

export default function RolePermissionMatrixView({ roleId }: Props) {
  const vm = useRolePermissionViewModel(roleId);

  if (!vm.canManageGlobal) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
        <Shield className="w-10 h-10 opacity-40" />
        <p className="text-sm">
          You must be a Global Admin to modify Base Roles.
        </p>
      </div>
    );
  }

  if (vm.isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (vm.isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-destructive gap-3">
        <AlertTriangle className="w-10 h-10 opacity-60" />
        <p className="text-sm font-medium">Failed to load role permissions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            {vm.roleName} Base Permissions
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Modifying these will instantly update access for all users with this
            role.
          </p>
        </div>

        {vm.isDirty && (
          <Button onClick={vm.handleSave} disabled={vm.isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {vm.isSaving ? "Saving..." : "Save Global Changes"}
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search base permissions..."
          value={vm.searchQuery}
          onChange={(e) => vm.setSearchQuery(e.target.value)}
          className="w-full h-10 pl-10 pr-4 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Permissions Grid */}
      <div className="space-y-4">
        {Array.from(vm.filteredGroups.entries()).map(([resource, items]) => (
          <div
            key={resource}
            className="bg-card border rounded-xl overflow-hidden"
          >
            <div className="bg-muted/30 px-4 py-2 border-b">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {formatResource(resource)}
              </span>
            </div>
            <div className="divide-y divide-border/50">
              {items.map((item) => {
                const isChecked = vm.selectedSlugs.has(item.slug);
                return (
                  <div
                    key={item.slug}
                    className="flex items-center justify-between p-3 hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">
                        {formatAction(item.slug)}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">
                        {item.slug}
                      </span>
                    </div>
                    <Switch
                      checked={isChecked}
                      onCheckedChange={(val) => vm.handleToggle(item.slug, val)}
                      disabled={vm.roleName === "SUPER_ADMIN"} // Protect Super Admins
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
