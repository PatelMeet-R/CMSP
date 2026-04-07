import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookOpen, Edit2, X, Save, ArrowLeft } from "lucide-react";

import { useAppSelector } from "@/store/hook";
import { ROLES } from "@/core/Constants/enums/role-enum-value";

import { useBranchViewModel } from "@/modules/branch/viewModel/useBranchViewModel";
import { useEnumViewModel } from "@/modules/enums/viewModel/useEnumViewModel";
import { EnumCategory } from "@/modules/enums/types/enum.schemas";
import {
  updateSubjectSchema,
  type BranchResponse,
  type SemesterResponse,
  type UpdateSubjectPayload,
} from "../types/subject.schemas";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DynamicSelect } from "@/components/custom/dashboard/DynamicSelect";
import { Label } from "@/components/ui/label";
import { useSubjectDetailViewModel } from "@/modules/subject/viewModel/useSubjectDetailModel";
import { PageBreadcrumb } from "@/components/custom/dashboard/PageBreadcrumb";

export const SubjectDetailModule = () => {
  const { id } = useParams();
  const numericId = id ? Number(id) : undefined;
  const navigate = useNavigate();

  // --- UI STATE ---
  const [isEditing, setIsEditing] = useState(false);

  // --- REDUX STATE ---
  const { user } = useAppSelector((state) => state.auth);
  // Check permissions based on role
  const canEdit = user?.role === ROLES.SUPER_ADMIN || user?.role === ROLES.HOD;
  const canEditBranch = user?.role === ROLES.SUPER_ADMIN;

  // --- VIEW MODELS ---
  const { subject, isFetching, isUpdating, updateSubject } =
    useSubjectDetailViewModel(numericId);
  const { branches, isLoading: isBranchesLoading } = useBranchViewModel();
  const { enums: semesters, isLoading: isSemestersLoading } = useEnumViewModel(
    EnumCategory.SEMESTER,
  );

  // Format Dropdowns
  const branchOptions =
    branches?.map((b: BranchResponse) => ({ id: b.id, label: b.name })) || [];
  const semesterOptions =
    semesters?.map((s: SemesterResponse) => ({ id: s.id, label: s.value })) ||
    [];

  // --- FORM SETUP ---
  const form = useForm<UpdateSubjectPayload>({
    resolver: zodResolver(updateSubjectSchema),
    defaultValues: {
      name: "",
      code: "",
      branchId: undefined,
      semesterId: undefined,
    },
  });

  // Populate form when subject data arrives or when user cancels edit
  useEffect(() => {
    if (subject) {
      form.reset({
        name: subject.name,
        code: subject.code,
        // Fallback to user's branch if HOD, else use subject's branch
        branchId:
          subject.branch?.id ||
          (user?.role === ROLES.HOD ? user?.branchId : undefined),
        semesterId: subject.semester?.id,
      });
    }
  }, [subject, form, isEditing, user]);

  // --- HANDLERS ---
  const handleCancel = () => {
    form.reset();
    setIsEditing(false);
  };

  const onSubmit = async (data: UpdateSubjectPayload) => {
    await updateSubject(data);
    setIsEditing(false); // Switch back to view mode on success
  };

  const { isDirty } = form.formState;

  // --- RENDER Skeleton ---
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-muted/10 rounded-lg border">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full max-w-sm" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* --- BREADCRUMB --- */}
      <PageBreadcrumb
        items={[
          { label: "Subjects", icon: BookOpen, onClick: () => navigate(-1) },
          { label: subject?.code || "", isLoading: isFetching },
        ]}
      />

      {/* --- MAIN CARD --- */}
      <Card className="border-none shadow-md">
        <CardHeader className="pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="shrink-0 hidden sm:flex"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <CardTitle className="text-2xl">
                {isFetching ? <Skeleton className="h-8 w-64" /> : subject?.name}
              </CardTitle>
              {!isFetching && subject && (
                <div className="text-sm text-muted-foreground mt-1 font-mono">
                  Code: {subject.code}
                </div>
              )}
            </div>
          </div>

          {/* --- ACTION BUTTONS --- */}
          {canEdit && !isFetching && (
            <div className="shrink-0 w-full sm:w-auto">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="w-full sm:w-auto"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isUpdating}
                    className="flex-1 sm:flex-none"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={!isDirty || isUpdating}
                    className="flex-1 sm:flex-none"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isUpdating ? "Saving..." : "Save"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-6">
          {isFetching ? (
            <LoadingSkeleton />
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-muted/20 rounded-lg border">
                {/* --- SUBJECT NAME --- */}
                <div className="space-y-3">
                  <Label className="text-muted-foreground uppercase text-xs font-bold tracking-wider">
                    Subject Name
                  </Label>
                  {!isEditing ? (
                    <div className="text-base font-medium">{subject?.name}</div>
                  ) : (
                    <Input
                      {...form.register("name")}
                      placeholder="Enter subject name"
                      className="max-w-md bg-background"
                    />
                  )}
                  {form.formState.errors.name && (
                    <p className="text-xs text-red-500">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                {/* --- SUBJECT CODE --- */}
                <div className="space-y-3">
                  <Label className="text-muted-foreground uppercase text-xs font-bold tracking-wider">
                    Subject Code
                  </Label>
                  {!isEditing ? (
                    <Badge
                      variant="outline"
                      className="text-sm font-mono px-3 py-1 bg-background"
                    >
                      {subject?.code}
                    </Badge>
                  ) : (
                    <Input
                      {...form.register("code")}
                      placeholder="Enter subject code"
                      className="max-w-md bg-background"
                    />
                  )}
                  {form.formState.errors.code && (
                    <p className="text-xs text-red-500">
                      {form.formState.errors.code.message}
                    </p>
                  )}
                </div>

                {/* --- BRANCH --- */}
                <div className="space-y-3">
                  <Label className="text-muted-foreground uppercase text-xs font-bold tracking-wider">
                    Assigned Branch
                  </Label>
                  {!isEditing ? (
                    <div className="text-base font-medium">
                      {subject?.branch?.name || "N/A"}
                    </div>
                  ) : (
                    <div className="max-w-md">
                      <Controller
                        name="branchId"
                        control={form.control}
                        render={({ field }) => (
                          <DynamicSelect
                            value={field.value}
                            onChange={field.onChange}
                            options={branchOptions}
                            placeholder="Select Branch"
                            isLoading={isBranchesLoading}
                            disabled={!canEditBranch}
                          />
                        )}
                      />
                      {/* Hint text for HODs explaining why it's locked */}
                      {!canEditBranch && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Branch is locked to your assigned department.
                        </p>
                      )}
                    </div>
                  )}
                  {form.formState.errors.branchId && (
                    <p className="text-xs text-red-500">
                      {form.formState.errors.branchId.message}
                    </p>
                  )}
                </div>

                {/* --- SEMESTER --- */}
                <div className="space-y-3">
                  <Label className="text-muted-foreground uppercase text-xs font-bold tracking-wider">
                    Semester
                  </Label>
                  {!isEditing ? (
                    <div className="text-base font-medium">
                      {subject?.semester?.value || "N/A"}
                    </div>
                  ) : (
                    <div className="max-w-md">
                      <Controller
                        name="semesterId"
                        control={form.control}
                        render={({ field }) => (
                          <DynamicSelect
                            value={field.value}
                            onChange={field.onChange}
                            options={semesterOptions}
                            placeholder="Select Semester"
                            isLoading={isSemestersLoading}
                          />
                        )}
                      />
                    </div>
                  )}
                  {form.formState.errors.semesterId && (
                    <p className="text-xs text-red-500">
                      {form.formState.errors.semesterId.message}
                    </p>
                  )}
                </div>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
