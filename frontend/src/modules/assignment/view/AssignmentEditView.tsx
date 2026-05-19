import { format } from "date-fns";
import {
  BookOpen,
  CalendarIcon,
  Save,
  Building2,
  FileText,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FieldLabel } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SpinnerCustom } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { PageBreadcrumb } from "@/components/custom/dashboard/PageBreadcrumb";
import { AsyncCombobox } from "@/components/custom/dashboard/AsyncCombobox";
import { FileUploader } from "@/components/custom/dashboard/files-uploader";
import { useAssignmentEditViewModel } from "../viewModel/useAssignmentEditViewModel";
import { getPreviewUrl } from "@/lib/file-utils";

export default function AssignmentEditView() {
  // 🚨 The View only consumes the ViewModel
  const vm = useAssignmentEditViewModel();

  if (vm.isFetching || vm.isPageLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6 pb-12">
        <Skeleton className="h-10 w-64" />
        <Card className="shadow-sm">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12">
      <PageBreadcrumb
        items={[
          { label: "Dashboard", onClick: () => vm.navigate("/") },
          { label: "Assignments", onClick: () => vm.navigate("/assignments") },
          { label: vm.assignment?.title || "Edit Assignment" },
        ]}
      />

      <div className="flex items-center justify-between pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            Edit Assignment
          </h1>
          <p className="text-muted-foreground mt-1">
            Update the coursework details or attach a new reference file.
          </p>
        </div>
      </div>

      <Card className="shadow-sm border-primary/10">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle>Update Details</CardTitle>
        </CardHeader>

        <CardContent className="p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <FieldLabel className="text-xs font-bold text-muted-foreground uppercase">
                Assignment Title
              </FieldLabel>
              <Input
                {...vm.form.register("title")}
                className={
                  vm.form.formState.errors.title ? "border-red-500" : ""
                }
              />
            </div>

            <div className="space-y-2">
              <FieldLabel className="text-xs font-bold text-muted-foreground uppercase">
                Due Date
              </FieldLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !vm.form.watch("dueDate") && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {vm.form.watch("dueDate") ? (
                      format(vm.form.watch("dueDate"), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={vm.form.watch("dueDate")}
                    onSelect={(date) =>
                      vm.form.setValue("dueDate", date as Date, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <FieldLabel className="text-xs font-bold text-muted-foreground uppercase">
              Instructions / Description
            </FieldLabel>
            <Textarea
              className={cn(
                "min-h-30 resize-y",
                vm.form.formState.errors.description ? "border-red-500" : "",
              )}
              {...vm.form.register("description")}
            />
          </div>

          <div className="p-5 rounded-xl border bg-muted/10 space-y-5">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" /> Routing Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {vm.canManageGlobal && (
                <div className="space-y-2">
                  <FieldLabel className="text-xs font-bold text-muted-foreground uppercase">
                    Branch
                  </FieldLabel>
                  <Select
                    value={vm.form.watch("branchId")}
                    onValueChange={(val) => {
                      vm.form.setValue("branchId", val, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                      vm.form.setValue("subjectId", "");
                    }}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {vm.branches?.map((b) => (
                        <SelectItem key={b.id} value={b.id.toString()}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <FieldLabel className="text-xs font-bold text-muted-foreground uppercase">
                  Subject
                </FieldLabel>
                <AsyncCombobox
                  key={`sub-combo-${vm.form.watch("branchId") || "all"}`}
                  placeholder="Search subject..."
                  value={vm.form.watch("subjectId")}
                  onChange={(val, raw) => {
                    vm.handleSubjectSelect(val, raw);
                    vm.form.setValue("subjectId", val ?? "", {
                      shouldDirty: true,
                    });
                  }}
                  fetchOptions={vm.fetchSubjectsMemoized}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <FieldLabel className="text-xs font-bold text-muted-foreground uppercase flex justify-between">
              <span>Attached Reference File</span>
              {vm.fileState.isUploading && (
                <span className="text-primary animate-pulse flex items-center gap-1">
                  <SpinnerCustom /> Uploading...
                </span>
              )}
            </FieldLabel>

            {vm.fileState.existingUrl &&
            !vm.fileState.removedExistingFile &&
            !vm.fileState.file ? (
              <div className="flex items-center justify-between p-4 border rounded-lg bg-background">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Existing Attachment</p>
                    <a
                      href={getPreviewUrl(vm.fileState.existingUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      View File
                    </a>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500"
                  onClick={() => vm.fileState.setRemovedExistingFile(true)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            ) : (
              <FileUploader
                file={vm.fileState.file}
                onChange={vm.fileState.setFile}
                maxSizeMB={5}
              />
            )}
          </div>

          <div className="pt-6 border-t flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => vm.navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              size="lg"
              onClick={vm.onSubmit}
              disabled={
                vm.isSubmitting ||
                !vm.form.formState.isValid ||
                (!vm.form.formState.isDirty &&
                  !vm.fileState.file &&
                  !vm.fileState.removedExistingFile)
              }
            >
              {vm.isSubmitting ? (
                <>
                  <SpinnerCustom /> Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" /> Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
