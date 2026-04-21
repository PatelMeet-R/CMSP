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
import { SpinnerCustom } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";

import { PageBreadcrumb } from "@/components/custom/dashboard/PageBreadcrumb";
import { useAssignmentEditViewModel } from "../viewModel/useAssignmentEditViewModel";
import { FileUploader } from "@/components/custom/dashboard/files-uploader";
import { ROUTENAME } from "@/core/Constants/RouteName";

export default function AssignmentEditView() {
  const vm = useAssignmentEditViewModel();

  if (vm.isFetching) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6 pb-12">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-150 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      <PageBreadcrumb
        items={[
          { label: "Dashboard", onClick: () => vm.navigate("/") },
          {
            label: vm.assignment?.title || "Assignments",
            onClick: () =>
              vm.navigate(
                ROUTENAME.VIEW_ASSIGNMENT.replace(
                  ":id",
                  `${vm.assignment?.id}`.toString(),
                ),
              ),
          },
          { label: "Edit" },
        ]}
      />

      <div className="flex items-center justify-between pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            Edit Assignment
          </h1>
          <p className="text-muted-foreground mt-1">
            Updating:{" "}
            <span className="font-semibold text-foreground">
              {vm.assignment?.title}
            </span>
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
                Assignment Title *
              </FieldLabel>
              <Input {...vm.form.register("title")} />
            </div>

            <div className="space-y-2">
              <FieldLabel className="text-xs font-bold text-muted-foreground uppercase">
                Due Date *
              </FieldLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal"
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
              Instructions / Description *
            </FieldLabel>
            <Textarea
              className="min-h-30 resize-y"
              {...vm.form.register("description")}
            />
          </div>

          {/* 🚀 OPTIMIZED ROUTING INFORMATION */}
          <div className="p-5 rounded-xl border bg-muted/10 space-y-5">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Routing Information
              <span className="text-xs font-normal text-muted-foreground italic ml-2">
                (Locked during edit)
              </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Subject Display */}
              <div className="space-y-2">
                <FieldLabel className="text-xs font-bold text-muted-foreground uppercase">
                  Subject
                </FieldLabel>
                {/* A simple disabled input displaying the name we already fetched */}
                <Input
                  disabled
                  value={vm.assignment?.subjectName || "Loading..."}
                  className="bg-background text-muted-foreground opacity-70 cursor-not-allowed"
                />
              </div>

              {/* Semester Display */}
              <div className="space-y-2">
                <FieldLabel className="text-xs font-bold text-muted-foreground uppercase">
                  Semester
                </FieldLabel>
                <Input
                  disabled
                  value={vm.assignment?.semester || "Loading..."}
                  className="bg-background text-muted-foreground opacity-70 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* FILE UPLOAD LOGIC */}
          <div className="space-y-2">
            <FieldLabel className="text-xs font-bold text-muted-foreground uppercase">
              Reference Material
            </FieldLabel>

            {vm.fileState.existingUrl &&
            !vm.fileState.removedExistingFile &&
            !vm.fileState.file ? (
              <div className="p-4 border rounded-xl bg-card shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <FileText className="w-6 h-6 text-primary/70" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Existing Attachment</p>
                    <a
                      href={vm.fileState.existingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-500 hover:underline"
                    >
                      View File
                    </a>
                  </div>
                </div>
                <Button
                  type="button"
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
