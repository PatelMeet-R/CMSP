import { usePermissionAuditViewModel } from "../viewModel/usePermissionAuditViewModel";
import {
  History,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Clock,
  User,
} from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface Props {
  targetUserId: string;
}

export default function PermissionAuditLogView({ targetUserId }: Props) {
  const vm = usePermissionAuditViewModel(targetUserId);

  if (!vm.canViewAudit) return null;

  if (vm.isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-6 w-48 rounded-lg" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (vm.auditLogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-border/50 bg-muted/10">
        <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <History className="w-7 h-7 text-muted-foreground/40" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          No permission changes recorded
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Changes will appear here when permissions are modified.
        </p>
      </div>
    );
  }

  const getStatusIcon = (state: string) => {
    switch (state) {
      case "grant":
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
      case "revoke":
        return <XCircle className="w-3.5 h-3.5 text-destructive shrink-0" />;
      default:
        return <MinusCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />;
    }
  };

  const getStateBadge = (state: string) => {
    switch (state) {
      case "grant":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800";
      case "revoke":
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <History className="h-4 w-4 text-primary" />
          Permission Audit Trail
        </h3>
        <Badge
          variant="secondary"
          className="text-[10px] font-mono px-2 py-0.5"
        >
          {vm.auditLogs.length} {vm.auditLogs.length === 1 ? "Entry" : "Entries"}
        </Badge>
      </div>

      {/* Timeline */}
      <div className="relative ml-4 border-l-2 border-border/50 space-y-6 py-2">
        {vm.auditLogs.map((log) => {
          const actorName = log.actor.personalInfo
            ? `${log.actor.personalInfo.firstName} ${log.actor.personalInfo.lastName}`
            : log.actor.email;

          return (
            <div key={log.id} className="relative pl-7">
              {/* Timeline Dot */}
              <div className="absolute -left-2 top-1.5 h-3.5 w-3.5 rounded-full bg-primary ring-[3px] ring-background shadow-sm" />

              <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm transition-shadow hover:shadow-md">
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3 px-5 py-4 bg-muted/20 border-b border-border/40">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {actorName}
                      </p>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        {format(
                          new Date(log.createdAt),
                          "MMM dd, yyyy 'at' hh:mm a",
                        )}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="shrink-0 bg-background text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5"
                  >
                    {log.details.updates.length} Changes
                  </Badge>
                </div>

                <div className="px-5 py-4 space-y-4">
                  {/* Justification Block */}
                  <div className="flex items-start gap-3 rounded-lg bg-amber-50/60 dark:bg-amber-950/15 border border-amber-200/50 dark:border-amber-900/30 p-3.5">
                    <ShieldAlert className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-amber-700/70 dark:text-amber-400/70 uppercase tracking-wider mb-1">
                        Audit Justification
                      </p>
                      <p className="text-xs text-amber-900 dark:text-amber-100 leading-relaxed italic">
                        "{log.details.reason}"
                      </p>
                    </div>
                  </div>

                  {/* Changes Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {log.details.updates.map((update, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2.5 text-xs bg-muted/20 border border-border/40 px-3 py-2 rounded-lg transition-colors hover:bg-muted/40"
                      >
                        {getStatusIcon(update.state)}
                        <span className="font-mono text-muted-foreground truncate flex-1 min-w-0">
                          {update.permissionSlug}
                        </span>
                        <Badge
                          variant="outline"
                          className={`shrink-0 text-[9px] uppercase tracking-wider font-bold px-1.5 py-0 ${getStateBadge(update.state)}`}
                        >
                          {update.state}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
