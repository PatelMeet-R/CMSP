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

interface UsersTableProps {
  users: any[];
  isLoading: boolean;
  isSuperAdmin: boolean;
  isStudent: boolean;
  onRowClick: (id: number) => void;
}

export function UsersTable({
  users,
  isLoading,
  isSuperAdmin,
  isStudent,
  onRowClick,
}: UsersTableProps) {
  // 🚀 PURELY DYNAMIC BADGES: No colors, no hardcoded switch cases.
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
    // 🚀 Responsive wrapper
    <div className="border rounded-md bg-card overflow-x-auto">
      <Table className="min-w-max">
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>User</TableHead>

            {/* 🚀 Dynamic Headers based on Role & Permissions */}
            {isStudent && <TableHead>Enrollment</TableHead>}
            <TableHead>Gender</TableHead>
            {isSuperAdmin && <TableHead>Branch</TableHead>}
            <TableHead>City</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell className="flex items-center gap-3">
                  {/* <Skeleton className="h-9 w-9 rounded-full shrink-0" /> */}
                  <Skeleton className="h-4 w-30" />
                </TableCell>
                {isStudent && (
                  <TableCell>
                    <Skeleton className="h-4 w-25" />
                  </TableCell>
                )}
                <TableCell>
                  <Skeleton className="h-5 w-15 rounded-full" />
                </TableCell>
                {isSuperAdmin && (
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
                {/* <TableCell className="text-right">
                  <Skeleton className="h-8 w-8 inline-block" />
                </TableCell> */}
              </TableRow>
            ))
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={
                  isStudent ? (isSuperAdmin ? 7 : 6) : isSuperAdmin ? 6 : 5
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
                {/* 1. Name & Avatar */}
                <TableCell className="flex items-center gap-3">
                  <span className="font-medium text-sm whitespace-nowrap">
                    {user.firstName} {user.lastName}
                  </span>
                </TableCell>

                {/* 2. Enrollment  */}
                {isStudent && (
                  <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                    {user.enrollmentNumber !== "NOT_REQUIRED"
                      ? user.enrollmentNumber
                      : "—"}
                  </TableCell>
                )}

                {/* 3. Gender */}
                <TableCell className="text-muted-foreground text-sm">
                  {user.gender?.value || "—"}
                </TableCell>

                {/* 4. Branch */}
                {isSuperAdmin && (
                  <TableCell className="text-muted-foreground font-medium text-sm whitespace-nowrap">
                    {user.branch?.name || "—"}
                  </TableCell>
                )}

                {/* 5. City */}
                <TableCell className="text-muted-foreground text-sm">
                  {user.address?.city || user.city || "—"}
                </TableCell>

                {/* 6. Status */}
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
