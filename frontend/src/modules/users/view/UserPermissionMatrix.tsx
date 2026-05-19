import { useState, useEffect } from "react";
import {
  Shield,
  ShieldPlus,
  Search,
  Info,
  AlertTriangle,
  Save,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useUserPermissionMatrixViewModel } from "../viewModel/useUserPermissionMatrixViewModel";
import type { PermissionSectionProps } from "@/modules/users/types/permission.interface";
import PermissionSaveDialog from "./PermissionSaveDialog";
import { formatAction, formatResource } from "@/lib/permission.utils";

// ═════════════════════════════════════════════
//  V2: Two-Tier Permission Matrix
// ═════════════════════════════════════════════

interface Props {
  personalInfoId: string;
}

export default function UserPermissionMatrix({ personalInfoId }: Props) {
  const vm = useUserPermissionMatrixViewModel(personalInfoId);

  // 🚨 SMART ACCORDION STATE
  const [accordionValue, setAccordionValue] = useState<string[]>([]);

  // Automatically expand accordions that have search results
  useEffect(() => {
    if (vm.searchQuery.trim().length > 0) {
      const sectionsToOpen: string[] = [];
      if (vm.filteredBase.size > 0) sectionsToOpen.push("base-section");
      if (vm.filteredExtra.size > 0) sectionsToOpen.push("extra-section");

      // 🚨 FIX: Only update state if the array actually changed.
      // This stops the accordion from glitching/jumping on every keystroke!
      setAccordionValue((prev) => {
        if (
          prev.length === sectionsToOpen.length &&
          prev.every((v) => sectionsToOpen.includes(v))
        ) {
          return prev;
        }
        return sectionsToOpen;
      });
    } else {
      setAccordionValue((prev) => (prev.length === 0 ? prev : []));
    }
  }, [vm.searchQuery, vm.filteredBase.size, vm.filteredExtra.size]);

  const isSearchEmpty =
    vm.searchQuery.trim().length > 0 &&
    vm.filteredBase.size === 0 &&
    vm.filteredExtra.size === 0;

  // ── PERMISSION CHECK ──
  if (!vm.canManage) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
        <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center">
          <Shield className="w-7 h-7 opacity-40" />
        </div>
        <p className="text-sm font-medium">
          You don&apos;t have permission to manage user permissions.
        </p>
      </div>
    );
  }

  // ── LOADING ──
  if (vm.isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-10 w-full rounded-lg" />
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  // ── ERROR ──
  if (vm.isError || !vm.matrix) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
        <div className="h-16 w-16 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-destructive/60" />
        </div>
        <p className="text-sm font-medium">Failed to load permission matrix.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h3 className="text-base font-semibold text-foreground">
            Permissions for{" "}
            <span className="text-primary">{vm.matrix.targetUser.name}</span>
          </h3>
          <Badge
            variant="outline"
            className="text-[10px] uppercase tracking-wider font-semibold"
          >
            {vm.matrix.targetUser.role}
          </Badge>
        </div>

        {vm.dirtyCount > 0 && (
          <div className="flex items-center gap-2.5">
            <Badge
              variant="secondary"
              className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 font-medium"
            >
              {vm.dirtyCount} unsaved{" "}
              {vm.dirtyCount === 1 ? "change" : "changes"}
            </Badge>
            <Button
              size="sm"
              onClick={() => vm.setIsSaveDialogOpen(true)}
              className="gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* ── SEARCH ── */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search permissions… (e.g. assignment:create)"
          value={vm.searchQuery}
          onChange={(e) => vm.setSearchQuery(e.target.value)}
          className="w-full h-10 pl-10 pr-4 text-sm border border-border/60 rounded-xl bg-background placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary/50 transition-all"
        />
        {vm.searchQuery && (
          <button
            onClick={() => vm.setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ── MAIN CONTENT ── */}
      {isSearchEmpty ? (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-2xl border-border/50 bg-muted/10 gap-4">
          <div className="p-4 bg-muted/40 rounded-full">
            <Search className="w-7 h-7 text-muted-foreground opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">
              No permissions found
            </p>
            <p className="text-xs text-muted-foreground mt-1.5 max-w-sm">
              No permission matching "
              <span className="text-foreground font-medium">
                {vm.searchQuery}
              </span>
              " was found.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => vm.setSearchQuery("")}
            className="mt-1"
          >
            Clear Search
          </Button>
        </div>
      ) : (
        <Accordion
          type="multiple"
          value={accordionValue}
          onValueChange={setAccordionValue}
          className="w-full space-y-3"
        >
          {/* ── SECTION 1: BASE ROLE PERMISSIONS ── */}
          <PermissionSection
            sectionId="base-section"
            title="Inherited Permissions"
            subtitle={`Comes from the ${vm.matrix.targetUser.role} role. Clicking a chip will revoke it (turns red).`}
            icon={<Shield className="w-4 h-4 text-blue-500" />}
            groups={vm.filteredBase}
            isBaseSection={true}
            getChecked={vm.getEffectiveChecked}
            onToggle={vm.handleToggle}
            localOverrides={vm.localOverrides}
            accentColor="blue"
          />

          {/* ── SECTION 2: EXTRA PERMISSIONS ── */}
          <PermissionSection
            sectionId="extra-section"
            title="Extra Permissions"
            subtitle="Permissions beyond their base role. Clicking a chip will grant it (turns green)."
            icon={<ShieldPlus className="w-4 h-4 text-emerald-500" />}
            groups={vm.filteredExtra}
            isBaseSection={false}
            getChecked={vm.getEffectiveChecked}
            onToggle={vm.handleToggle}
            localOverrides={vm.localOverrides}
            accentColor="emerald"
          />
        </Accordion>
      )}

      {/* ── SAVE DIALOG ── */}
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

// ═════════════════════════════════════════════
//  Sub-Component: Permission Section
// ═════════════════════════════════════════════

interface ExtendedPermissionSectionProps extends PermissionSectionProps {
  sectionId: string;
}

function PermissionSection({
  sectionId,
  title,
  subtitle,
  icon,
  groups,
  isBaseSection,
  getChecked,
  onToggle,
  localOverrides,
  accentColor,
}: ExtendedPermissionSectionProps) {
  const borderColor =
    accentColor === "blue"
      ? "border-blue-200/60 dark:border-blue-900/40"
      : "border-emerald-200/60 dark:border-emerald-900/40";
  const headerBg =
    accentColor === "blue"
      ? "bg-blue-50/40 dark:bg-blue-950/15 hover:bg-blue-50/70 dark:hover:bg-blue-900/25"
      : "bg-emerald-50/40 dark:bg-emerald-950/15 hover:bg-emerald-50/70 dark:hover:bg-emerald-900/25";

  const totalCount = Array.from(groups.values()).flat().length;

  if (groups.size === 0) {
    return (
      <div className={`rounded-xl border ${borderColor} overflow-hidden bg-card`}>
        <div className={`px-5 py-3.5 ${headerBg} flex items-center gap-2.5`}>
          {icon}
          <span className="text-sm font-semibold text-foreground">{title}</span>
        </div>
        <div className="p-5 text-center text-sm text-muted-foreground">
          No matching permissions in this section.
        </div>
      </div>
    );
  }

  const sectionHasOverrides = Array.from(groups.values())
    .flat()
    .some((item) => localOverrides.has(item.slug));

  return (
    <AccordionItem
      value={sectionId}
      className={`rounded-xl border ${borderColor} bg-card shadow-sm overflow-hidden transition-shadow hover:shadow-md`}
    >
      <AccordionTrigger
        className={`px-5 py-3.5 ${headerBg} hover:no-underline transition-colors`}
      >
        <div className="flex flex-col items-start text-left w-full">
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm font-semibold text-foreground">
              {title}
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              ({totalCount})
            </span>
            {sectionHasOverrides && (
              <span
                className="w-2 h-2 rounded-full bg-amber-500 animate-pulse ml-1.5"
                title="Contains modified permissions"
              />
            )}
          </div>
          <div className="flex items-start gap-1.5 mt-1.5 ml-6">
            <Info className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground font-normal leading-relaxed">
              {subtitle}
            </p>
          </div>
        </div>
      </AccordionTrigger>

      {/* 🚨 FIX: Replaced 'p-5 space-y-8' with tightly controlled padding and gaps */}
      <AccordionContent className="px-5 pb-5 pt-3 space-y-5">
        {Array.from(groups.entries()).map(([resource, items]) => (
          <div key={resource} className="space-y-2.5">
            <div className="border-b border-border/40 pb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {formatResource(resource)}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {items.map((item) => {
                const checked = getChecked(item);
                const isDirty = localOverrides.has(item.slug);

                return (
                  <PermissionChip
                    key={item.slug}
                    item={item}
                    isBaseSection={isBaseSection}
                    checked={checked}
                    isDirty={isDirty}
                    onToggle={onToggle}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </AccordionContent>
    </AccordionItem>
  );
}

// ═════════════════════════════════════════════
//  Sub-Component: Clickable Permission Chip
// ═════════════════════════════════════════════

function PermissionChip({
  item,
  isBaseSection,
  checked,
  isDirty,
  onToggle,
}: {
  item: any;
  isBaseSection: boolean;
  checked: boolean;
  isDirty: boolean;
  onToggle: (item: any, isBase: boolean, val: boolean) => void;
}) {
  const handleClick = () => {
    onToggle(item, isBaseSection, !checked);
  };

  let stateStyles = "";

  if (isBaseSection) {
    if (checked) {
      stateStyles =
        "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700/60";
    } else {
      stateStyles =
        "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30";
    }
  } else {
    if (!checked) {
      stateStyles =
        "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700/60";
    } else {
      stateStyles =
        "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30";
    }
  }

  const dirtyStyles = isDirty
    ? "ring-2 ring-amber-400 dark:ring-amber-500 ring-offset-1 dark:ring-offset-background"
    : "";

  return (
    <button
      onClick={handleClick}
      title={item.slug}
      className={`inline-flex items-center justify-center px-3.5 py-1.5 rounded-full text-[11px] font-semibold transition-all duration-150 border select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${stateStyles} ${dirtyStyles}`}
    >
      {formatAction(item.slug)}
    </button>
  );
}
