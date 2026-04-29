import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { History, Plus, Edit, Search, CalendarDays, Copy } from "lucide-react";

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

import { useMyAssignmentListViewModel } from "../viewModel/useMyAssignmentListViewModel";
import { useEnumViewModel } from "@/modules/enums/viewModel/useEnumViewModel";
import { EnumCategory } from "@/modules/enums/types/enum.schemas";
import { ROUTENAME } from "@/core/Constants/RouteName";
import type { AssignmentDTO } from "../types/assignment.schemas";

export default function MyAssignmentsView() {
  const navigate = useNavigate();
  const vm = useMyAssignmentListViewModel();
  const { enums: academicYears } = useEnumViewModel(EnumCategory.ACADEMIC_YEAR);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      <PageBreadcrumb
        items={[
          { label: "Dashboard", onClick: () => navigate("/") },
          { label: "My Assignments History" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <History className="w-8 h-8 text-primary" />
            My Assignment History
          </h1>
          <p className="text-muted-foreground mt-1">
            Track, edit, and manage all coursework you have ever created.
          </p>
        </div>
        <Button onClick={() => navigate(ROUTENAME.ADD_ASSIGNMENT)}>
          <Plus className="w-4 h-4 mr-2" />
          Create New
        </Button>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-muted/10 p-4 rounded-lg border">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search my assignments..."
            className="pl-9 bg-background"
            value={vm.filters.search}
            onChange={(e) => vm.filters.setSearch(e.target.value)}
          />
        </div>

        <Select
          value={
            vm.filters.academicYearId
              ? String(vm.filters.academicYearId)
              : "all"
          }
          onValueChange={(val) =>
            vm.filters.setAcademicYearId(
              val === "all" ? undefined : val,
            )
          }
        >
          <SelectTrigger className="w-50 bg-background">
            <CalendarDays className="w-4 h-4 mr-2 opacity-50" />
            <SelectValue placeholder="All Time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time (History)</SelectItem>
            {academicYears?.map((y) => (
              <SelectItem key={y.id} value={String(y.id)}>
                {y.value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="bg-muted/10 border-b pb-4">
          <CardTitle className="text-lg">My Created Assignments</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {vm.isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Subject / Year</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vm.assignments.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center h-32 text-muted-foreground"
                    >
                      You haven't created any assignments yet.
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
                        <div className="text-xs text-muted-foreground mt-1">
                          Year: {assignment.academicYear}
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(assignment.dueDate), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Duplicate Assignment"
                            onClick={() =>
                              navigate(
                                `${ROUTENAME.ADD_ASSIGNMENT}?cloneId=${assignment.id}`,
                              )
                            }
                          >
                            <Copy className="w-4 h-4 text-emerald-600" />
                          </Button>

                          {/* Existing Edit Button */}
                          <Button
                            variant="ghost"
                            title="Edit Assignment"
                            size="icon"
                            onClick={() =>
                              navigate(
                                ROUTENAME.EDIT_ASSIGNMENT.replace(
                                  ":id",
                                  assignment.id.toString(),
                                ),
                              )
                            }
                          >
                            <Edit className="w-4 h-4 text-blue-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* PAGINATION */}
      {vm.meta && vm.meta.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <Button
            variant="outline"
            disabled={vm.filters.page === 1}
            onClick={() => vm.filters.setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-sm font-medium">
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
