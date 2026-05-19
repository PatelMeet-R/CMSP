import { BookOpen, Hash, Building2, GraduationCap } from "lucide-react";
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
        <TableHeader className="bg-muted/30">
          <TableRow>
            <TableHead className="w-28 hidden sm:table-cell">
              <span className="flex items-center gap-1.5">
                <Hash className="h-3 w-3 opacity-60" />
                Code
              </span>
            </TableHead>
            <TableHead>
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-3 w-3 opacity-60" />
                Subject Name
              </span>
            </TableHead>
            {showBranchColumn && (
              <TableHead className="hidden md:table-cell">
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-3 w-3 opacity-60" />
                  Branch
                </span>
              </TableHead>
            )}
            <TableHead className="w-32">
              <span className="flex items-center gap-1.5">
                <GraduationCap className="h-3 w-3 opacity-60" />
                Semester
              </span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            //  THE SKELETON ROWS
            skeletonRows.map((_, index) => (
              <TableRow key={index}>
                {/* Skeleton for Code */}
                <TableCell className="hidden sm:table-cell">
                  <Skeleton className="h-6 w-20 rounded-full" />
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
                <div className="flex flex-col items-center justify-center text-muted-foreground py-8">
                  <div className="h-14 w-14 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                    <BookOpen className="h-6 w-6 opacity-40" />
                  </div>
                  <p className="text-sm font-medium">
                    No subjects found
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Try adjusting your filters or search query.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            subjects.map((subject) => (
              <TableRow
                key={subject.id}
                className="cursor-pointer transition-colors duration-150 hover:bg-muted/40"
                onClick={() => onRowClick(subject.id)}
              >
                {/* Code Cell (Hidden on mobile) */}
                <TableCell className="font-medium hidden sm:table-cell">
                  <Badge
                    variant="outline"
                    className="font-mono text-[11px] bg-primary/5 text-primary border-primary/20 px-2.5 py-0.5"
                  >
                    {subject.code}
                  </Badge>
                </TableCell>

                {/* Name Cell */}
                <TableCell>
                  <div className="font-medium text-foreground text-sm">
                    {subject.name}
                  </div>
                  <div className="text-[11px] text-muted-foreground sm:hidden mt-1 font-mono">
                    {subject.code}
                  </div>
                </TableCell>

                {/* Branch Cell (SuperAdmin Only) */}
                {showBranchColumn && (
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {subject.branch || "—"}
                  </TableCell>
                )}

                {/* Semester Cell */}
                <TableCell>
                  <Badge
                    variant="secondary"
                    className="font-medium text-xs px-2.5 py-0.5"
                  >
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
