import { Users, Search, Trash2 } from "lucide-react";
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

interface ActiveAssignmentsTableProps {
  isSuperAdmin: boolean;
  branches: any[];
  // 🚀 Data & Handlers passed down from the ViewModel
  search: string;
  onSearchChange: (val: string) => void;
  branchId: number | undefined;
  onBranchChange: (val: number | undefined) => void;
  data: any[];
  isLoading: boolean;
  onUnassign: (id: number) => void;
  isUnassigning: boolean;
}

export function ActiveAssignmentsTable({
  isSuperAdmin,
  branches,
  search,
  onSearchChange,
  branchId,
  onBranchChange,
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

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name, code, or subject..."
                className="pl-9 h-9 text-sm bg-muted/20"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>

            {isSuperAdmin && (
              <Select
                value={branchId ? String(branchId) : "all"}
                onValueChange={(val) =>
                  onBranchChange(val === "all" ? undefined : Number(val))
                }
              >
                <SelectTrigger className="h-9 w-45 bg-muted/20">
                  <SelectValue placeholder="All Branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches?.map((branch: any) => (
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
                <TableHead>Semester</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center h-24 text-muted-foreground"
                  >
                    No active assignments found.
                  </TableCell>
                </TableRow>
              ) : (
                data?.map((mapping: any) => (
                  <TableRow key={mapping.id}>
                    <TableCell>
                      <div className="font-medium">
                        {mapping.professor?.personalInfo?.firstName}{" "}
                        {mapping.professor?.personalInfo?.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {mapping.professor?.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{mapping.subject?.name}</div>
                      <Badge variant="secondary" className="text-[10px]">
                        {mapping.subject?.code}
                      </Badge>
                    </TableCell>
                    <TableCell>{mapping.semester?.value}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:bg-red-50 hover:text-red-700"
                        onClick={() => onUnassign(mapping.id)}
                        disabled={isUnassigning}
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
