import {
  Shield,
  ShieldPlus,
  Search,
  Info,
  AlertTriangle,
  Save,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useUserPermissionMatrixViewModel } from "../viewModel/useUserPermissionMatrixViewModel";
import type {
  LocalOverride,
  PermissionMatrixItem,
  PermissionSectionProps,
} from "@/modules/users/types/permission.interface";
import PermissionSaveDialog from "./PermissionSaveDialog";
import {
  formatAction,
  formatResource,
  groupByResource,
} from "@/lib/permission.utils";

// =============================================
//  V2: Two-Tier Permission Matrix
//
//  Section 1: "Inherited" — Base Role Permissions
//    - Toggling OFF = REVOKE override
//    - Toggling ON  = DEFAULT (remove revoke)
//
//  Section 2: "Extra" — Assignable Permissions
//    - Toggling ON  = GRANT override
//    - Toggling OFF = DEFAULT (remove grant)
//
//  Local state only
// =============================================

interface Props {
  personalInfoId: string;
}

export default function UserPermissionMatrix({ personalInfoId }: Props) {
  const vm = useUserPermissionMatrixViewModel(personalInfoId);

  // ---- PERMISSION CHECK ----
  if (!vm.canManage) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
        <Shield className="w-10 h-10 opacity-40" />
        <p className="text-sm">
          You don&apos;t have permission to manage user permissions.
        </p>
      </div>
    );
  }

  // ---- LOADING ----
  if (vm.isLoading) {
    return (
      <div className="space-y-6 p-1">
        <Skeleton className="h-10 w-full rounded-lg" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // ---- ERROR ----
  if (vm.isError || !vm.matrix) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
        <AlertTriangle className="w-10 h-10 text-destructive/60" />
        <p className="text-sm">Failed to load permission matrix.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ---- HEADER ---- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-foreground">
            Permissions for{" "}
            <span className="text-primary">{vm.matrix.targetUser.name}</span>
          </h3>
          <Badge variant="outline" className="text-xs uppercase tracking-wider">
            {vm.matrix.targetUser.role}
          </Badge>
        </div>

        {vm.dirtyCount > 0 && (
          <div className="flex items-center gap-3">
            <Badge
              variant="secondary"
              className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
            >
              {vm.dirtyCount} unsaved {vm.dirtyCount === 1 ? "change" : "changes"}
            </Badge>
            <Button size="sm" onClick={() => vm.setIsSaveDialogOpen(true)}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* ---- SEARCH ---- */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search permissions... (e.g. assignment:create)"
          value={vm.searchQuery}
          onChange={(e) => vm.setSearchQuery(e.target.value)}
          className="w-full h-10 pl-10 pr-4 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary/50 transition-colors"
        />
      </div>

      {/* ---- SECTION 1: BASE ROLE PERMISSIONS ---- */}
      <PermissionSection
        title="Inherited Permissions"
        subtitle={`Comes from the ${vm.matrix.targetUser.role} role. Toggling off will revoke this permission for this user only.`}
        icon={<Shield className="w-4 h-4 text-blue-500" />}
        groups={vm.filteredBase}
        isBaseSection={true}
        getChecked={vm.getEffectiveChecked}
        onToggle={vm.handleToggle}
        localOverrides={vm.localOverrides}
        accentColor="blue"
      />

      {/* ---- SECTION 2: EXTRA PERMISSIONS ---- */}
      <PermissionSection
        title="Extra Permissions"
        subtitle="Permissions you can grant to this user beyond their base role."
        icon={<ShieldPlus className="w-4 h-4 text-emerald-500" />}
        groups={vm.filteredExtra}
        isBaseSection={false}
        getChecked={vm.getEffectiveChecked}
        onToggle={vm.handleToggle}
        localOverrides={vm.localOverrides}
        accentColor="emerald"
      />

      {/* ---- SAVE DIALOG ---- */}
      <PermissionSaveDialog
        isOpen={vm.isSaveDialogOpen}
        onClose={() => vm.setIsSaveDialogOpen(false)}
        personalInfoId={personalInfoId}
        localOverrides={vm.localOverrides}
        onSuccess={vm.handleSaveSuccess}
      />
    </div>
  );
}

// =============================================
//  Sub-Component: Permission Section
// =============================================

function PermissionSection({
  title,
  subtitle,
  icon,
  groups,
  isBaseSection,
  getChecked,
  onToggle,
  localOverrides,
  accentColor,
}: PermissionSectionProps) {
  const borderColor =
    accentColor === "blue"
      ? "border-blue-200 dark:border-blue-900/40"
      : "border-emerald-200 dark:border-emerald-900/40";
  const headerBg =
    accentColor === "blue"
      ? "bg-blue-50/50 dark:bg-blue-950/20"
      : "bg-emerald-50/50 dark:bg-emerald-950/20";

  if (groups.size === 0) {
    return (
      <div className={`rounded-xl border ${borderColor} overflow-hidden`}>
        <div className={`px-4 py-3 ${headerBg} flex items-center gap-2`}>
          {icon}
          <span className="text-sm font-semibold text-foreground">{title}</span>
        </div>
        <div className="p-6 text-center text-sm text-muted-foreground">
          No permissions found.
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border ${borderColor} overflow-hidden`}>
      {/* Section Header */}
      <div className={`px-4 py-3 ${headerBg} border-b ${borderColor}`}>
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-semibold text-foreground">{title}</span>
          <span className="text-xs text-muted-foreground">
            ({Array.from(groups.values()).flat().length})
          </span>
        </div>
        <div className="flex items-start gap-1.5 mt-1">
          <Info className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      {/* Resource Groups */}
      <div className="divide-y divide-border/50">
        {Array.from(groups.entries()).map(([resource, items]) => (
          <div key={resource} className="px-4 py-3">
            {/* Resource label */}
            <div className="mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {formatResource(resource)}
              </span>
            </div>

            {/* Permission rows */}
            <div className="space-y-1">
              {items.map((item) => {
                const checked = getChecked(item);
                const isDirty = localOverrides.has(item.slug);

                return (
                  <div
                    key={item.slug}
                    className={`flex items-center justify-between py-2 px-3 rounded-lg transition-colors ${
                      isDirty
                        ? "bg-amber-50/70 dark:bg-amber-950/20 ring-1 ring-amber-200/50 dark:ring-amber-800/30"
                        : "hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-foreground truncate">
                          {formatAction(item.slug)}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono truncate">
                          {item.slug}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isDirty && (
                        <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                          Modified
                        </span>
                      )}
                      <Switch
                        checked={checked}
                        onCheckedChange={(val) =>
                          onToggle(item, isBaseSection, val)
                        }
                      />
                    </div>
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
