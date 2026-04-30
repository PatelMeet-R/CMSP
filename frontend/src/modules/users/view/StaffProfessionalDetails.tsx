import {
  Briefcase,
  Building,
  CalendarDays,
  GraduationCap,
  AlertCircle,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type {
  StaffProfessionalDetailsProps,
  // SubjectAssignmentData,
} from "@/modules/users/types/staff.interface";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export function StaffProfessionalDetails({
  staffProfile,
  historyMap,
  expandedYearKey,
  setExpandedYearKey,
}: StaffProfessionalDetailsProps) {
  if (!staffProfile) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  const historyEntries = historyMap ? Object.entries(historyMap) : [];
  const hasHistory = historyEntries.length > 0;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
      {/* LEFT COLUMN: Professional Info Card */}
      <div className="space-y-6 col-span-1">
        <Card className="shadow-sm border-primary/20">
          <CardHeader className="bg-primary/5 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              Professional Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <GraduationCap className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">
                {staffProfile?.designation || "No Designation"}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Building className="w-4 h-4 text-muted-foreground" />
              <span>
                {staffProfile?.officeLocation || "Office Not Assigned"}
              </span>
            </div>
            {staffProfile?.joiningDate && (
              <div className="flex items-center gap-3 text-sm">
                <CalendarDays className="w-4 h-4 text-muted-foreground" />
                <span>
                  Joined{" "}
                  {new Date(staffProfile.joiningDate).toLocaleDateString(
                    "en-IN",
                  )}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* RIGHT COLUMN: Subject History Accordion */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="bg-muted/30 px-5 py-4 border-b flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Teaching History
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Subjects assigned to this professor across academic years.
            </p>
          </div>
          <Badge variant="secondary" className="font-mono">
            {hasHistory ? `${historyEntries.length} Years` : "No Records"}
          </Badge>
        </div>

        <div className="p-2 sm:p-4">
          {!hasHistory ? (
            <div className="text-center py-10 flex flex-col items-center justify-center text-muted-foreground">
              <AlertCircle className="w-8 h-8 opacity-20 mb-2" />
              <p className="text-sm">No teaching history found.</p>
            </div>
          ) : (
            <Accordion
              type="single"
              collapsible
              value={expandedYearKey}
              onValueChange={setExpandedYearKey}
              className="w-full space-y-3"
            >
              {historyEntries.map(([yearKey, items]) => (
                <AccordionItem
                  key={yearKey}
                  value={yearKey}
                  className="border rounded-lg bg-card overflow-hidden shadow-sm"
                >
                  <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 hover:no-underline transition-colors data-[state=open]:bg-muted/30 data-[state=open]:border-b">
                    <div className="flex items-center justify-between w-full pr-4">
                      <span className="font-semibold text-sm">
                        Academic Year: {yearKey}
                      </span>
                      <Badge variant="outline" className="bg-background">
                        {items.length} Subjects
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-3 px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-col gap-1.5 p-3 rounded-lg border bg-muted/10 relative"
                        >
                          {item.deletedAt && (
                            <Badge
                              variant="destructive"
                              className="absolute top-2 right-2 text-[9px] px-1.5 py-0"
                            >
                              Revoked
                            </Badge>
                          )}

                          <div className="flex items-center gap-2">
                            <Badge className="text-[10px] font-mono bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                              {item.subject?.code || "Unknown Code"}
                            </Badge>
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              Sem {item.semester?.value || "N/A"}
                            </span>
                          </div>

                          <p
                            className={`text-sm font-medium ${item.deletedAt ? "text-muted-foreground line-through decoration-destructive/50" : "text-foreground"}`}
                          >
                            {item.subject?.name || "Unknown Subject"}
                          </p>

                          <span className="text-[10px] text-muted-foreground mt-1">
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
