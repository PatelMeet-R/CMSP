import { Loader2, BookOpen } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface SubjectTableProps {
  subjects: any[]; // Replace 'any' with your actual Subject interface later!
  isLoading: boolean;
  isSuperAdmin: boolean;
  onRowClick: (subjectId: number) => void;
}

export function SubjectTable({
  subjects,
  isLoading,
  isSuperAdmin,
  onRowClick,
}: SubjectTableProps) {
  return (
    <div className="rounded-md border bg-card overflow-hidden w-full">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            {/* Hide Code column on tiny mobile screens to save space */}
            <TableHead className="w-25 hidden sm:table-cell">Code</TableHead>
            <TableHead>Subject Name</TableHead>
            {/* Only SuperAdmins see the Branch column */}
            {isSuperAdmin && (
              <TableHead className="hidden md:table-cell">Branch</TableHead>
            )}
            <TableHead className="w-30">Semester</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={isSuperAdmin ? 4 : 3}
                className="h-48 text-center"
              >
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mb-2 text-primary" />
                  <p>Loading curriculum...</p>
                  {/* //<spinner> */}
                </div>
              </TableCell>
            </TableRow>
          ) : subjects.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={isSuperAdmin ? 4 : 3}
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
                  {/* MOBILE FALLBACK: Show the code under the name ONLY on small screens */}
                  <div className="text-xs text-muted-foreground sm:hidden mt-1 font-mono">
                    {subject.code}
                  </div>
                </TableCell>

                {/* Branch Cell (SuperAdmin Only) */}
                {isSuperAdmin && (
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
