import { usePermissionAuditViewModel } from "../viewModel/usePermissionAuditViewModel";
import {
  History,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  MinusCircle,
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
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  if (vm.auditLogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border rounded-xl bg-card">
        <History className="w-12 h-12 opacity-20 mb-3" />
        <p className="text-sm">
          No permission changes have been recorded for this user.
        </p>
      </div>
    );
  }

  const getStatusIcon = (state: string) => {
    switch (state) {
      case "grant":
        return <CheckCircle2 className="w-3 h-3 text-emerald-500 mr-1" />;
      case "revoke":
        return <XCircle className="w-3 h-3 text-destructive mr-1" />;
      default:
        return <MinusCircle className="w-3 h-3 text-muted-foreground mr-1" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative border-l-2 border-muted ml-3 space-y-8 py-4">
        {vm.auditLogs.map((log) => {
          const actorName = log.actor.personalInfo
            ? `${log.actor.personalInfo.firstName} ${log.actor.personalInfo.lastName}`
            : log.actor.email;

          return (
            <div key={log.id} className="relative pl-6">
              {/* Timeline Dot */}
              <div className="absolute -left-2.25 top-1 h-4 w-4 rounded-full bg-primary ring-4 ring-background" />

              <div className="bg-card border rounded-xl p-4 shadow-sm space-y-3">
                {/* Header: Who and When */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Modified by {actorName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(
                        new Date(log.createdAt),
                        "MMM dd, yyyy 'at' hh:mm a",
                      )}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-muted/50 text-[10px] uppercase tracking-wider"
                  >
                    {log.details.updates.length} Changes
                  </Badge>
                </div>

                {/* Reason Block */}
                <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-lg p-3 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-amber-700/70 dark:text-amber-400/70 uppercase tracking-wider mb-0.5">
                      Audit Justification
                    </p>
                    <p className="text-xs text-amber-900 dark:text-amber-100 leading-relaxed italic">
                      "{log.details.reason}"
                    </p>
                  </div>
                </div>

                {/* The Exact Changes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {log.details.updates.map((update, idx) => (
                    <div
                      key={idx}
                      className="flex items-center text-xs bg-muted/30 px-2.5 py-1.5 rounded-md border border-border/50"
                    >
                      {getStatusIcon(update.state)}
                      <span className="font-mono text-muted-foreground truncate">
                        {update.permissionSlug}
                      </span>
                      <span className="ml-auto font-semibold uppercase text-[10px]">
                        {update.state}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
