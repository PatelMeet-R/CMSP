import {
  Briefcase,

  CalendarDays,
  GraduationCap,
  AlertCircle,
  Clock,
  BookOpen,
  MapPin,

} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type {
  StaffProfessionalDetailsProps,
} from "@/modules/users/types/staff.interface";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

// ─────────────────────────────────────────────
//  Professional Info Stat Card
// ─────────────────────────────────────────────
function InfoTile({
  icon: Icon,
  label,
  value,
  accentClass = "text-primary",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accentClass?: string;
}) {
  return (
    <div className="group flex items-start gap-3.5 rounded-xl border border-border/50 bg-card p-4 transition-all hover:border-border hover:shadow-sm">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/5 ${accentClass}`}
      >
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="text-sm font-semibold text-foreground truncate">
          {value}
        </span>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════
//  MAIN COMPONENT
// ═════════════════════════════════════════════
export function StaffProfessionalDetails({
  staffProfile,
  historyMap,
  expandedYearKey,
  setExpandedYearKey,
}: StaffProfessionalDetailsProps) {
  if (!staffProfile) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const historyEntries = historyMap ? Object.entries(historyMap) : [];
  const hasHistory = historyEntries.length > 0;

  return (
    <div className="space-y-8">
      {/* ── Professional Info – Bento Tiles ── */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-primary" />
          Professional Profile
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <InfoTile
            icon={GraduationCap}
            label="Designation"
            value={staffProfile?.designation || "No Designation"}
          />
          <InfoTile
            icon={MapPin}
            label="Office Location"
            value={staffProfile?.officeLocation || "Not Assigned"}
            accentClass="text-amber-600 dark:text-amber-400"
          />
          {staffProfile?.joiningDate && (
            <InfoTile
              icon={CalendarDays}
              label="Joining Date"
              value={new Date(staffProfile.joiningDate).toLocaleDateString(
                "en-IN",
                { year: "numeric", month: "long", day: "numeric" },
              )}
              accentClass="text-emerald-600 dark:text-emerald-400"
            />
          )}
        </div>
      </div>

      {/* ── Teaching History – Accordion ── */}
      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
        <div className="bg-muted/30 px-5 sm:px-6 py-4 border-b flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Teaching History
            </h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Subjects assigned across academic years
            </p>
          </div>
          <Badge
            variant="secondary"
            className="font-mono text-xs px-2.5 py-0.5"
          >
            {hasHistory ? `${historyEntries.length} Years` : "No Records"}
          </Badge>
        </div>

        <div className="p-3 sm:p-5">
          {!hasHistory ? (
            <div className="flex flex-col items-center justify-center py-14 text-muted-foreground">
              <div className="h-14 w-14 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 opacity-40" />
              </div>
              <p className="text-sm font-medium">No teaching history found.</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Subject assignments will appear here once added.
              </p>
            </div>
          ) : (
            <Accordion
              type="single"
              collapsible
              value={expandedYearKey}
              onValueChange={setExpandedYearKey}
              className="w-full space-y-2"
            >
              {historyEntries.map(([yearKey, items]) => (
                <AccordionItem
                  key={yearKey}
                  value={yearKey}
                  className="border rounded-xl bg-card overflow-hidden shadow-sm transition-shadow hover:shadow-md data-[state=open]:shadow-md"
                >
                  <AccordionTrigger className="px-4 sm:px-5 py-3.5 hover:bg-muted/40 hover:no-underline transition-colors data-[state=open]:bg-muted/30 data-[state=open]:border-b">
                    <div className="flex items-center justify-between w-full pr-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <CalendarDays className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-semibold text-sm">
                          {yearKey}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-background text-xs font-medium"
                      >
                        <BookOpen className="h-3 w-3 mr-1 opacity-60" />
                        {items.length} {items.length === 1 ? "Subject" : "Subjects"}
                      </Badge>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="pt-3 pb-4 px-4 sm:px-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className={`group relative flex flex-col gap-2 p-4 rounded-xl border transition-all ${item.deletedAt
                              ? "bg-rose-50/30 border-rose-200/50 dark:bg-rose-950/10 dark:border-rose-900/30"
                              : "bg-muted/20 border-border/50 hover:border-border hover:shadow-sm"
                            }`}
                        >
                          {item.deletedAt && (
                            <Badge
                              variant="destructive"
                              className="absolute top-3 right-3 text-[9px] px-1.5 py-0 font-semibold"
                            >
                              Revoked
                            </Badge>
                          )}

                          <div className="flex items-center gap-2">
                            <Badge className="text-[10px] font-mono bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 px-2 py-0.5">
                              {item.subject?.code || "N/A"}
                            </Badge>
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Sem {item.semester?.value || "N/A"}
                            </span>
                          </div>

                          <p
                            className={`text-sm font-medium leading-tight ${item.deletedAt
                                ? "text-muted-foreground line-through decoration-destructive/50"
                                : "text-foreground"
                              }`}
                          >
                            {item.subject?.name || "Unknown Subject"}
                          </p>

                          <span className="text-[10px] text-muted-foreground/80 mt-auto">
                            Assigned:{" "}
                            {format(new Date(item.createdAt), "MMM dd, yyyy")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </div>
    </div>
  );
}
