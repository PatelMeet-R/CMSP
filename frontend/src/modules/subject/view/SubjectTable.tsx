import { BookOpen } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Subject } from "@/modules/subject/types/subject.schemas";
import { Skeleton } from "@/components/ui/skeleton";

interface SubjectTableProps {
  subjects: Subject[];
  isLoading: boolean;
  showBranchColumn: boolean;
  onRowClick: (subjectId: string) => void;
}

export function SubjectTable({
  subjects,
  isLoading,
  showBranchColumn,
  onRowClick,
}: SubjectTableProps) {
  const skeletonRows = Array.from({ length: 10 });
  return (
    /*  overflow-x-auto for mobile safety */
    <div className="w-full overflow-x-auto bg-card">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-25 hidden sm:table-cell">Code</TableHead>
            <TableHead>Subject Name</TableHead>
            {showBranchColumn && (
              <TableHead className="hidden md:table-cell">Branch</TableHead>
            )}
            <TableHead className="w-30">Semester</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            //  THE SKELETON ROWS
            skeletonRows.map((_, index) => (
              <TableRow key={index}>
                {/* Skeleton for Code */}
                <TableCell className="hidden sm:table-cell">
                  <Skeleton className="h-6 w-20" />
                </TableCell>

                {/* Skeleton for Subject Name */}
                <TableCell>
                  <Skeleton className="h-5 w-3/4 max-w-62.5 mb-2" />
                  {/* Mobile code skeleton */}
                  <Skeleton className="h-4 w-24 sm:hidden" />
                </TableCell>

                {/* Skeleton for Branch (SuperAdmin only) */}
                {showBranchColumn && (
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-5 w-40" />
                  </TableCell>
                )}

                {/* Skeleton for Semester Badge */}
                <TableCell>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </TableCell>
              </TableRow>
            ))
          ) : subjects.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={showBranchColumn ? 4 : 3}
                className="h-48 text-center"
              >
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <BookOpen className="h-8 w-8 mb-2 opacity-20" />
                  <p>No subjects found matching your filters.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            subjects.map((subject) => (
              <TableRow
                key={subject.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onRowClick(subject.id)}
              >
                {/* Code Cell (Hidden on mobile) */}
                <TableCell className="font-medium hidden sm:table-cell">
                  <Badge variant="outline" className="font-mono">
                    {subject.code}
                  </Badge>
                </TableCell>

                {/* Name Cell */}
                <TableCell>
                  <div className="font-medium text-foreground">
                    {subject.name}
                  </div>
                  <div className="text-xs text-muted-foreground sm:hidden mt-1 font-mono">
                    {subject.code}
                  </div>
                </TableCell>

                {/* Branch Cell (SuperAdmin Only) */}
                {showBranchColumn && (
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {subject.branch || "—"}
                  </TableCell>
                )}

                {/* Semester Cell */}
                <TableCell>
                  <Badge variant="secondary" className="font-normal">
                    {subject.semester || "—"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
