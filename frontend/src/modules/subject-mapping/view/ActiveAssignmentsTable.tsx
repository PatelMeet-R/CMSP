import { Users, Search, Trash2} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { BranchResponse } from "@/modules/subject/types/subject.schemas";
import type { ActiveAssignmentTableResponse } from "@/modules/subject-mapping/types/subject-mapping.types";

interface ActiveAssignmentsTableProps {
  isSuperAdmin: boolean;
  branches: BranchResponse[];
  academicYears?: { id: string; key: string; value: string }[];

  // Handlers
  search: string;
  onSearchChange: (val: string) => void;
  branchId: string | undefined;
  onBranchChange: (val: string | undefined) => void;

  // 🚀 Added Academic Year Filter Prop
  academicYearId: string | undefined;
  onAcademicYearChange: (val: string | undefined) => void;

  // 🚀 FIXED: data is an array!
  data: ActiveAssignmentTableResponse[];
  isLoading: boolean;
  onUnassign: (id: string) => void;
  isUnassigning: boolean;
}

export function ActiveAssignmentsTable({
  isSuperAdmin,
  branches,
  academicYears,
  search,
  onSearchChange,
  branchId,
  onBranchChange,
  academicYearId,
  onAcademicYearChange,
  data,
  isLoading,
  onUnassign,
  isUnassigning,
}: ActiveAssignmentsTableProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-xl flex items-center gap-2 shrink-0">
            <Users className="w-6 h-6 text-primary" />
            Active Matrix
          </CardTitle>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name, code..."
                className="pl-9 h-9 text-sm bg-muted/20"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>

            {/* 🚀 NEW: Academic Year Filter */}
            <Select
              value={academicYearId ? String(academicYearId) : "all"}
              onValueChange={(val) =>
                onAcademicYearChange(val === "all" ? undefined : val)
              }
            >
              <SelectTrigger className="h-9 w-40 bg-muted/20">
                <SelectValue placeholder="Academic Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {academicYears?.map((year) => (
                  <SelectItem key={year.id} value={year.id.toString()}>
                    {year.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Branch Filter (SuperAdmin Only) */}
            {isSuperAdmin && (
              <Select
                value={branchId ? String(branchId) : "all"}
                onValueChange={(val) =>
                  onBranchChange(val === "all" ? undefined : val)
                }
              >
                <SelectTrigger className="h-9 w-40 bg-muted/20">
                  <SelectValue placeholder="All Branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches?.map((branch: BranchResponse) => (
                    <SelectItem key={branch.id} value={branch.id.toString()}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Professor</TableHead>
                <TableHead>Subject</TableHead>
                {/* 🚀 Conditional Header for Branch */}
                {isSuperAdmin && <TableHead>Branch</TableHead>}
                <TableHead>Semester</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.length === 0 ? (
                <TableRow>
                  <TableCell
                    // Adjust colSpan dynamically based on admin status
                    colSpan={isSuperAdmin ? 5 : 4}
                    className="text-center h-24 text-muted-foreground"
                  >
                    No active assignments found.
                  </TableCell>
                </TableRow>
              ) : (
                data?.map((mapping: ActiveAssignmentTableResponse) => (
                  <TableRow key={mapping.id}>
                    {/* 🚀 FIXED: Now uses the flattened mapper properties */}
                    <TableCell>
                      <div className="font-medium">
                        {mapping.professor?.name || "Unknown"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {mapping.professor?.email || "No email"}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="font-medium">{mapping.subject?.name}</div>
                      <Badge variant="secondary" className="text-[10px]">
                        {mapping.subject?.code}
                      </Badge>
                    </TableCell>

                    {/* 🚀 Conditional Cell for Branch */}
                    {isSuperAdmin && (
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {mapping.subject?.branch || "N/A"}
                        </Badge>
                      </TableCell>
                    )}

                    <TableCell>
                      <div className="font-medium">
                        {mapping.semester || "N/A"}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {mapping.academicYear}
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:bg-red-50 hover:text-red-700"
                        onClick={() => onUnassign(mapping.id)}
                        disabled={isUnassigning}
                        title={`Assigned by: ${mapping.assignedBy}`} // Neat tooltip addition!
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
