import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { BookOpen, Plus, Eye, FileText, Search, History } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { PageBreadcrumb } from "@/components/custom/dashboard/PageBreadcrumb";
import { useAssignmentListViewModel } from "../viewModel/useAssignmentListViewModel";
import { useAppSelector } from "@/store/hook";
import { ROLES } from "@/core/Constants/enums/role-enum-value";
import { ROUTENAME } from "@/core/Constants/RouteName";
import { getPreviewUrl } from "@/lib/file-utils";

//  Imports for Filters
import { useEnumViewModel } from "@/modules/enums/viewModel/useEnumViewModel";
import { EnumCategory } from "@/modules/enums/types/enum.schemas";
import { useBranchViewModel } from "@/modules/branch/viewModel/useBranchViewModel";
import type { AssignmentDTO } from "../types/assignment.schemas";

export default function AssignmentListView() {
  const navigate = useNavigate();
  const vm = useAssignmentListViewModel();
  const { user } = useAppSelector((state) => state.auth);

  // 🚀 Load Dropdown Data
  const { enums: academicYears } = useEnumViewModel(EnumCategory.ACADEMIC_YEAR);
  const { branches } = useBranchViewModel();

  const canCreate =
    user?.role === ROLES.SUPER_ADMIN ||
    user?.role === ROLES.HOD ||
    user?.role === ROLES.PROFESSOR;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      <PageBreadcrumb
        items={[
          { label: "Dashboard", onClick: () => navigate("/") },
          { label: "Assignments" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            Assignments Matrix
          </h1>
          <p className="text-muted-foreground mt-1">
            View, manage, and grade student assignments.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          {vm.hasCreatedAssignments && (
            <Button
              variant="secondary"
              // Assuming your route is /assignments/me, adjust if needed
              onClick={() => navigate("/assignments/me")}
            >
              <History className="w-4 h-4 mr-2" />
              My Assignments
            </Button>
          )}

          {canCreate && (
            <Button
              onClick={() => navigate(ROUTENAME.ADD_ASSIGNMENT)}
              className="shrink-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Assignment
            </Button>
          )}
        </div>
      </div>

      {/* 🚀 NEW: FILTER BAR */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-muted/10 p-4 rounded-lg border">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, subject, or code..."
            className="pl-9 bg-background"
            value={vm.filters.search}
            onChange={(e) => vm.filters.setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Academic Year Select */}
          <Select
            value={
              vm.filters.academicYearId
                ? String(vm.filters.academicYearId)
                : "all"
            }
            onValueChange={(val) =>
              vm.filters.setAcademicYearId(
                val === "all" ? undefined : Number(val),
              )
            }
          >
            <SelectTrigger className="w-40 bg-background">
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {academicYears?.map((y) => (
                <SelectItem key={y.id} value={String(y.id)}>
                  {y.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Branch Select (SuperAdmin Only) */}
          {user?.role === ROLES.SUPER_ADMIN && (
            <Select
              value={vm.filters.branchId ? String(vm.filters.branchId) : "all"}
              onValueChange={(val) =>
                vm.filters.setBranchId(val === "all" ? undefined : Number(val))
              }
            >
              <SelectTrigger className="w-45 bg-background">
                <SelectValue placeholder="All Branches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {branches?.map((b) => (
                  <SelectItem key={b.id} value={String(b.id)}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* TABLE SECTION */}
      <Card className="shadow-sm">
        <CardHeader className="bg-muted/10 border-b pb-4">
          <CardTitle className="text-lg">Recent Assignments</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {vm.isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Semester / Branch</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Attachment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vm.assignments.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center h-32 text-muted-foreground"
                      >
                        No assignments found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    vm.assignments.map((assignment: AssignmentDTO) => (
                      <TableRow key={assignment.id}>
                        <TableCell className="font-medium">
                          {assignment.title}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-primary/5">
                            {assignment.subjectName}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">
                            {assignment.semester}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {assignment.branchName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">
                            {format(
                              new Date(assignment.dueDate),
                              "MMM dd, yyyy",
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {assignment.attachmentUrl ? (
                            <a
                              href={getPreviewUrl(assignment.attachmentUrl)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              <FileText className="w-3 h-3 mr-1" />
                              View File
                            </a>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              None
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                navigate(
                                  ROUTENAME.VIEW_ASSIGNMENT.replace(
                                    ":id",
                                    assignment.id.toString(),
                                  ),
                                )
                              }
                              title="View Details"
                            >
                              <Eye className="w-4 h-4 text-muted-foreground" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 🚀 NEW: PAGINATION CONTROLS */}
      {vm.meta && vm.meta.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <Button
            variant="outline"
            disabled={vm.filters.page === 1}
            onClick={() => vm.filters.setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-sm font-medium text-muted-foreground">
            Page {vm.filters.page} of {vm.meta.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={vm.filters.page === vm.meta.totalPages}
            onClick={() => vm.filters.setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
