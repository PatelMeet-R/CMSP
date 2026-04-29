import { format } from "date-fns";
import {
  Calendar,
  Building2,
  Clock,
  FileText,
  Download,
  Edit,
  Trash2,
  ArrowLeft,
  Eye,
  Copy,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageBreadcrumb } from "@/components/custom/dashboard/PageBreadcrumb";
import { useAssignmentDetailViewModel } from "../viewModel/useAssignmentDetailViewModel";
import { cn } from "@/lib/utils";
import { ROUTENAME } from "@/core/Constants/RouteName";
import { forceFileDownload, getPreviewUrl } from "@/lib/file-utils";
import { SecureDeleteModal } from "@/components/custom/model-secure-delete";

const getDownloadUrl = (
  url: string | null | undefined,
  originalFilename: string | null | undefined,
) => {
  if (!url) return "";
  if (!originalFilename) return url;
  const parts = url.split("/upload/");
  if (parts.length === 2) {
    return `${parts[0]}/upload/fl_attachment:${originalFilename}/${parts[1]}`;
  }
  return url;
};

export default function AssignmentDetailView() {
  const vm = useAssignmentDetailViewModel();
  const { assignment, isLoading, canModify } = vm;

  if (isLoading || !assignment) {
    return (
      <div className="w-full max-w-5xl mx-auto space-y-6 pb-12">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-100 w-full" />
      </div>
    );
  }

  const isOverdue = new Date(assignment.dueDate) < new Date();

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12">
      <PageBreadcrumb
        items={[
          { label: "Dashboard", onClick: () => vm.navigate("/") },
          { label: "Assignments", onClick: () => vm.navigate("/assignments") },
          { label: assignment.title },
        ]}
      />

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b">
        <div className="flex gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => vm.navigate(-1)}
            className="shrink-0 mt-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground leading-tight">
              {assignment.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary hover:bg-primary/20"
              >
                {assignment.subjectName}
              </Badge>
              <Badge
                variant="outline"
                className="text-muted-foreground border-muted-foreground/30"
              >
                {assignment.semester}
              </Badge>
              {isOverdue && <Badge variant="destructive">Overdue</Badge>}
            </div>
          </div>
        </div>

        {canModify && (
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              onClick={() =>
                vm.navigate(
                  `${ROUTENAME.ADD_ASSIGNMENT}?cloneId=${assignment.id}`,
                )
              }
              className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 border-emerald-200"
            >
              <Copy className="w-4 h-4 mr-2" /> Clone
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                vm.navigate(
                  ROUTENAME.EDIT_ASSIGNMENT.replace(":id", assignment.id),
                )
              }
              className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 border-blue-200"
            >
              <Edit className="w-4 h-4 mr-2" /> Edit
            </Button>
            <Button
              variant="outline"
              className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200"
              onClick={vm.triggerDeleteModal}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap leading-relaxed">
                {assignment.description}
              </div>
            </CardContent>
          </Card>

          {assignment.attachmentUrl && (
            <Card className="shadow-sm border-blue-100 overflow-hidden">
              <div className="bg-blue-50 border-b border-blue-100 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900">
                      Reference Material
                    </h3>
                    <p className="text-xs text-blue-600/80">
                      {assignment.originalFilename || "Attached File"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white"
                    onClick={() =>
                      window.open(
                        getPreviewUrl(assignment.attachmentUrl!),
                        "_blank",
                      )
                    }
                  >
                    <Eye className="w-4 h-4 mr-2" /> View
                  </Button>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() =>
                      forceFileDownload(
                        getDownloadUrl(
                          assignment.attachmentUrl,
                          assignment.originalFilename,
                        ),
                        assignment.originalFilename || "download",
                      )
                    }
                  >
                    <Download className="w-4 h-4 mr-2" /> Download
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="bg-muted/30 border-b py-3">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                <div className="p-4 flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase">
                      Posted Date
                    </p>
                    <p className="font-medium mt-1">
                      {format(new Date(assignment.createdAt), "MMM dd, yyyy")}
                    </p>
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

      <SecureDeleteModal
        isOpen={!!vm.assignmentToDelete}
        onCancel={() => vm.setAssignmentToDelete(null)}
        onConfirm={vm.confirmDeletion}
        targetName={vm.assignmentToDelete?.title || ""}
        isDeleting={vm.isDeleting}
      />
    </div>
  );
}
