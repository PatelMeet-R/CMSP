import { format } from "date-fns";
import {
  BookOpen,
  Calendar,
  Building2,
  Clock,
  FileText,
  Download,
  Edit,
  Trash2,
  ArrowLeft,
  Eye,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageBreadcrumb } from "@/components/custom/dashboard/PageBreadcrumb";
import { useAssignmentDetailViewModel } from "../viewModel/useAssignmentDetailViewModel";
import { cn } from "@/lib/utils";
import { ROUTENAME } from "@/core/Constants/RouteName";
import { getPreviewUrl } from "@/lib/file-utils";
import { SecureDeleteModal } from "@/components/custom/model-secure-delete";

// 🚀 HELPER FUNCTION: DOWNLOAD - Cloudinary Native Renaming
const getDownloadUrl = (
  url: string | null | undefined,
  originalFilename: string | null | undefined,
) => {
  if (!url) return "";

  // If we don't have a name, just force the standard download
  if (!originalFilename)
    return url.replace("/upload/", "/upload/fl_attachment/");

  // Cloudinary explicitly supports renaming downloaded files natively in the URL!
  // Syntax: /upload/fl_attachment:My_File_Name/
  const nameParts = originalFilename.split(".");
  nameParts.pop(); // Remove extension, Cloudinary handles it automatically
  const safeName = nameParts.join("").replace(/[^a-zA-Z0-9_-]/g, "_"); // Remove spaces/special chars

  return url.replace("/upload/", `/upload/fl_attachment:${safeName}/`);
};

export default function AssignmentDetailView() {
  const vm = useAssignmentDetailViewModel();
  const { assignment, isLoading, canEditOrDelete, navigate } = vm;

  if (isLoading) {
    return (
      <div className="w-full max-w-5xl mx-auto space-y-6 pb-12">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-96 md:col-span-2" />
          <Skeleton className="h-96 md:col-span-1" />
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="w-full max-w-5xl mx-auto text-center py-20">
        <h2 className="text-2xl font-bold">Assignment Not Found</h2>
        <Button onClick={() => navigate("/assignments")} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Assignments
        </Button>
      </div>
    );
  }

  const isOverdue = new Date(assignment.dueDate) < new Date();

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      <PageBreadcrumb
        items={[
          { label: "Dashboard", onClick: () => navigate("/") },
          { label: "Assignments", onClick: () => navigate("/assignments") },
          { label: "Assignment Details" },
        ]}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            {assignment.title}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant={isOverdue ? "destructive" : "default"}>
              {isOverdue ? "Overdue" : "Active"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Posted on {format(new Date(assignment.createdAt), "MMM dd, yyyy")}
            </span>
          </div>
        </div>

        {canEditOrDelete && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() =>
                navigate(
                  ROUTENAME.EDIT_ASSIGNMENT.replace(
                    ":id",
                    assignment.id.toString(),
                  ),
                )
              }
            >
              <Edit className="w-4 h-4 mr-2" /> Edit
            </Button>
            <Button
              variant="destructive"
              onClick={vm.triggerDeleteModal}
              disabled={vm.isDeleting}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </Button>

            <SecureDeleteModal
              isOpen={!!vm.assignmentToDelete}
              targetName={vm.assignmentToDelete?.title || ""}
              isDeleting={vm.isDeleting}
              onCancel={() => vm.setAssignmentToDelete(null)}
              onConfirm={vm.confirmDeletion}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="bg-muted/10 border-b pb-4">
              <CardTitle className="text-lg">Instructions</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="prose max-w-none text-foreground whitespace-pre-wrap">
                {assignment.description}
              </div>
            </CardContent>
          </Card>

          {assignment.attachmentUrl && (
            <Card className="shadow-sm border-primary/20">
              <CardHeader className="bg-primary/5 border-b pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Reference Material
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <FileText className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Attached Document</p>
                    <p className="text-xs text-muted-foreground">
                      Choose to preview or download the file.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* 🚀 FIXED BUTTON 1: PREVIEW (Using the raw, working URL) */}
                  <Button variant="outline" type="button" asChild>
                    <a
                      href={getPreviewUrl(assignment.attachmentUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </a>
                  </Button>

                  {/* 🚀 FIXED BUTTON 2: DOWNLOAD (Using Cloudinary's fl_attachment flag) */}
                  <Button type="button" asChild>
                    <a
                      href={getDownloadUrl(
                        assignment.attachmentUrl,
                        assignment.originalFilename,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="md:col-span-1 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="bg-muted/10 border-b pb-4">
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                <div className="p-4 flex items-start gap-3">
                  <BookOpen className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase">
                      Subject
                    </p>
                    <p className="font-medium mt-1">{assignment.subjectName}</p>
                  </div>
                </div>

                <div className="p-4 flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase">
                      Semester
                    </p>
                    <p className="font-medium mt-1">{assignment.semester}</p>
                  </div>
                </div>

                <div className="p-4 flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase">
                      Branch
                    </p>
                    <p className="font-medium mt-1">{assignment.branchName}</p>
                  </div>
                </div>

                <div className="p-4 flex items-start gap-3 bg-primary/5">
                  <Clock
                    className={cn(
                      "w-5 h-5 mt-0.5",
                      isOverdue ? "text-red-500" : "text-primary",
                    )}
                  />
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase">
                      Due Date
                    </p>
                    <p
                      className={cn(
                        "font-bold mt-1",
                        isOverdue ? "text-red-600" : "text-primary",
                      )}
                    >
                      {format(
                        new Date(assignment.dueDate),
                        "EEEE, MMMM dd, yyyy",
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
