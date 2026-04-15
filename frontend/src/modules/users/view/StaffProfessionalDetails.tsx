import {
  Briefcase,
  Building,
  CalendarDays,
  BookOpen,
  GraduationCap,
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
  SubjectAssignmentData,
} from "@/modules/users/types/staff.ui.schemas";

export function StaffProfessionalDetails({
  staffProfile,
  historyMap,
  expandedYearKey,
  setExpandedYearKey,
}: StaffProfessionalDetailsProps) {
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
      <div className="lg:col-span-2">
        <Card className="shadow-sm h-full">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary" />
              Subject Allocation History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Empty State */}
            {!historyMap || Object.keys(historyMap).length === 0 ? (
              <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
                <BookOpen className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-foreground">
                  No Subjects Assigned
                </h3>
                <p className="text-sm text-muted-foreground">
                  This professor has not been assigned to any subjects yet.
                </p>
              </div>
            ) : (
              /* The Interactive Accordion */
              <Accordion
                type="single"
                collapsible
                className="w-full"
                value={expandedYearKey}
                onValueChange={setExpandedYearKey}
              >
                {Object.entries(historyMap).map(
                  ([yearKey, assignments]: [
                    string,
                    SubjectAssignmentData[],
                  ]) => {
                    const displayYear = yearKey
                      .replace("AY_", "")
                      .replace("_", " - ");
                    const isCurrentYear = expandedYearKey === yearKey;

                    return (
                      <AccordionItem
                        value={yearKey}
                        key={yearKey}
                        className="border-b last:border-none"
                      >
                        <AccordionTrigger className="hover:no-underline hover:bg-muted/30 px-4 rounded-md transition-colors">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-lg">
                              {displayYear}
                            </span>
                            {isCurrentYear && (
                              <Badge
                                variant="default"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Active Year
                              </Badge>
                            )}
                            <Badge variant="outline">
                              {assignments.length} Subjects
                            </Badge>
                          </div>
                        </AccordionTrigger>

                        <AccordionContent className="pt-4 px-2 pb-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {assignments.map(
                              (mapping: SubjectAssignmentData) => (
                                <div
                                  key={mapping.id}
                                  className={`p-4 rounded-lg border ${mapping.deletedAt ? "bg-red-50/50 border-red-100 opacity-70" : "bg-card border-border shadow-sm"}`}
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <h4
                                      className="font-bold text-base line-clamp-1"
                                      title={mapping.subject?.name}
                                    >
                                      {mapping.subject?.name}
                                    </h4>
                                    <Badge variant="secondary">
                                      {mapping.subject?.code}
                                    </Badge>
                                  </div>
                                  <div className="text-sm text-muted-foreground flex justify-between">
                                    <span>Sem: {mapping.semester?.value}</span>
                                    {mapping.deletedAt && (
                                      <span className="text-red-500 font-medium text-xs">
                                        Unassigned
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  },
                )}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
