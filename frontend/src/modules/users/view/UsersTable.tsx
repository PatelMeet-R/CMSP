import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserListItem } from "../types/users.schemas";

interface UsersTableProps {
  users: UserListItem[];
  isLoading: boolean;
  showBranchColumn: boolean; 
  showEnrollmentColumn: boolean; 
  onRowClick: (id: string) => void;
}

export function UsersTable({
  users,
  isLoading,
  showBranchColumn,
  showEnrollmentColumn,
  onRowClick,
}: UsersTableProps) {
  const getBadge = (data?: { value: string }) => {
    return (
      <Badge
        variant="outline"
        className="w-fit text-muted-foreground whitespace-nowrap"
      >
        {data?.value || "Unknown"}
      </Badge>
    );
  };

  return (
    <div className="border rounded-md bg-card overflow-x-auto">
      <Table className="min-w-max">
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>User</TableHead>
            {showEnrollmentColumn && <TableHead>Enrollment</TableHead>}
            <TableHead>Gender</TableHead>
            {showBranchColumn && <TableHead>Branch</TableHead>}
            <TableHead>City</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-4 w-30" />
                </TableCell>
                {showEnrollmentColumn && (
                  <TableCell>
                    <Skeleton className="h-4 w-25" />
                  </TableCell>
                )}
                <TableCell>
                  <Skeleton className="h-5 w-15 rounded-full" />
                </TableCell>
                {showBranchColumn && (
                  <TableCell>
                    <Skeleton className="h-4 w-25" />
                  </TableCell>
                )}
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-15 rounded-full" />
                </TableCell>
              </TableRow>
            ))
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={
                  showEnrollmentColumn
                    ? showBranchColumn
                      ? 7
                      : 6
                    : showBranchColumn
                      ? 6
                      : 5
                }
                className="h-48 text-center text-muted-foreground"
              >
                No users found.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow
                key={user.id}
                className="hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => onRowClick(user.id)}
              >
                <TableCell className="flex items-center gap-3">
                  <span className="font-medium text-sm whitespace-nowrap">
                    {user.firstName} {user.lastName}
                  </span>
                </TableCell>
                {showEnrollmentColumn && (
                  <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                    {user.enrollmentNumber !== "NOT_REQUIRED"
                      ? user.enrollmentNumber
                      : "—"}
                  </TableCell>
                )}
                <TableCell className="text-muted-foreground text-sm">
                  {user.gender?.value || "—"}
                </TableCell>
                {showBranchColumn && (
                  <TableCell className="text-muted-foreground font-medium text-sm whitespace-nowrap">
                    {user.branch?.name || "—"}
                  </TableCell>
                )}
                <TableCell className="text-muted-foreground text-sm">
                  {user.address?.city || user.city || "—"}
                </TableCell>
                <TableCell>
                  {getBadge({
                    value:
                      user.accountStatus?.value ||
                      user.status?.value ||
                      "Unknown",
                  })}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
