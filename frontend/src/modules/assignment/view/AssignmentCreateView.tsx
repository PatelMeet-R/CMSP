import { format } from "date-fns";
import { BookOpen, CalendarIcon, CheckCircle2, Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { SpinnerCustom } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

import { PageBreadcrumb } from "@/components/custom/dashboard/PageBreadcrumb";
import { AsyncCombobox } from "@/components/custom/dashboard/AsyncCombobox";
import { FileUploader } from "@/components/custom/dashboard/files-uploader";
import { useAssignmentViewModel } from "../viewModel/useAssignmentViewModel";

export default function AssignmentCreateView() {
  //  The View only consumes the ViewModel
  const vm = useAssignmentViewModel();

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      <PageBreadcrumb
        items={[
          { label: "Dashboard", onClick: () => vm.navigate("/") },
          { label: "Assignments", onClick: () => vm.navigate("/assignments") },
          { label: "Create Assignment" },
        ]}
      />

      <div className="flex items-center justify-between pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            Create Assignment
          </h1>
          <p className="text-muted-foreground mt-1">
            Distribute coursework and materials to your students.
          </p>
        </div>
      </div>

      <Card className="shadow-sm border-primary/10">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle>Assignment Details</CardTitle>
          <CardDescription>
            All fields marked with an asterisk (*) are required.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <FieldLabel className="text-xs font-bold text-muted-foreground uppercase">
                Assignment Title *
              </FieldLabel>
              <Input
                placeholder="e.g., Chapter 4: Calculus Review"
                {...vm.form.register("title")}
                className={
                  vm.form.formState.errors.title ? "border-red-500" : ""
                }
              />
            </div>

            <div className="space-y-2">
              <FieldLabel className="text-xs font-bold text-muted-foreground uppercase">
                Due Date *
              </FieldLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !vm.form.watch("dueDate") && "text-muted-foreground",
                      vm.form.formState.errors.dueDate && "border-red-500",
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
                      })
                    }
                    initialFocus
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
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
              placeholder="Provide detailed instructions for the students..."
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
                    Branch *
                  </FieldLabel>
                  <Select
                    disabled={vm.isPageLoading}
                    value={
                      vm.form.watch("branchId")
                        ? String(vm.form.watch("branchId"))
                        : undefined
                    }
                    onValueChange={(val) => {
                      vm.form.setValue("branchId", val, {
                        shouldValidate: true,
                      });
                      vm.form.setValue(
                        "subjectId",
                        undefined as unknown as string,
                      );
                    }}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select Branch" />
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
                  Subject *
                </FieldLabel>
                {vm.canManageGlobal ? (
                  <AsyncCombobox
                    key={`sub-combo-${vm.activeBranchId || "all"}`}
                    placeholder="Search subject globally..."
                    value={vm.form.watch("subjectId")}
                    onChange={vm.handleSubjectSelect}
                    fetchOptions={vm.fetchSubjectsMemoized}
                    disabled={!vm.activeBranchId}
                  />
                ) : (
                  <Select
                    disabled={
                      vm.subjectState.isLoading ||
                      vm.subjectState.mySubjects.length === 0
                    }
                    value={
                      vm.form.watch("subjectId")
                        ? String(vm.form.watch("subjectId"))
                        : undefined
                    }
                    onValueChange={(val) => {
                      const selectedSub = vm.subjectState.mySubjects.find(
                        (s: any) => s.subjectId === val,
                      );
                      vm.handleSubjectSelect(val, selectedSub);
                    }}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue
                        placeholder={
                          vm.subjectState.isLoading
                            ? "Loading your subjects..."
                            : vm.subjectState.mySubjects.length === 0
                              ? "No assigned subjects found"
                              : "Select an assigned subject"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {vm.subjectState.mySubjects.map((sub: any) => (
                        <SelectItem
                          key={sub.subjectId}
                          value={sub.subjectId.toString()}
                        >
                          {sub.subjectCode} - {sub.subjectName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <FieldLabel className="text-xs font-bold text-muted-foreground uppercase">
                  Semester *
                </FieldLabel>
                <Select
                  disabled={true}
                  key={`sem-combo-${vm.form.watch("semesterId") || "empty"}`}
                  value={
                    vm.form.watch("semesterId")
                      ? String(vm.form.watch("semesterId"))
                      : undefined
                  }
                  onValueChange={(val) =>
                    vm.form.setValue("semesterId", val, {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Auto-filled by Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {vm.semesters?.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <FieldLabel className="text-xs font-bold text-muted-foreground uppercase">
                  Active Academic Year
                </FieldLabel>
                <div className="flex items-center gap-3 pt-1.5">
                  <Badge
                    variant="secondary"
                    className="text-sm px-3 py-1 bg-primary/10 text-primary border-primary/20"
                  >
                    {vm.activeYearDisplay}
                  </Badge>
                  <span className="text-xs text-muted-foreground italic">
                    Locked to global system
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <FieldLabel className="text-xs font-bold text-muted-foreground uppercase">
                Reference Material (Optional)
              </FieldLabel>
              {vm.fileState.isUploading && (
                <span className="text-xs text-primary animate-pulse flex items-center gap-1">
                  <SpinnerCustom /> Uploading to server...
                </span>
              )}
            </div>
            <FileUploader
              file={vm.fileState.file}
              onChange={vm.fileState.setFile}
              maxSizeMB={5}
            />
          </div>

          <div className="pt-6 border-t flex justify-end">
            <Button
              size="lg"
              onClick={vm.onSubmit}
              disabled={
                vm.isSubmitting ||
                !vm.form.formState.isValid ||
                (vm.canManageGlobal && !vm.form.watch("branchId"))
              }
              className="w-full sm:w-auto"
            >
              {vm.isSubmitting ? (
                <>
                  <SpinnerCustom /> Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" /> Create Assignment
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
