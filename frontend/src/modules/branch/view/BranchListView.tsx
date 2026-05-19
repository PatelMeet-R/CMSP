import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Plus, Edit } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

import { PageBreadcrumb } from "@/components/custom/dashboard/PageBreadcrumb";
import { BranchEditModal } from "./BranchEditModal";
import { useBranchViewModel } from "../viewModel/useBranchViewModel";
import { usePermissions } from "@/hooks/usePermissions";
import type { Branch } from "../types/branch.schemas";

export default function BranchListView() {
  const navigate = useNavigate();
  const { branches, isLoading } = useBranchViewModel(); // Reusing your existing ViewModel!

  const { hasPermission } = usePermissions();
  const canCreate = hasPermission("branch:create");
  const canUpdate = hasPermission("branch:update");

  const [branchToEdit, setBranchToEdit] = useState<Branch | null>(null);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      <PageBreadcrumb
        items={[
          { label: "Dashboard", onClick: () => navigate("/") },
          { label: "Branches Management" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Building2 className="w-8 h-8 text-primary" />
            Active Branches
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage the list of registered system branches and departments.
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => navigate("/branches/register")}>
            <Plus className="w-4 h-4 mr-2" /> Register Branch
          </Button>
        )}
      </div>

      <Card className="shadow-sm">
        <CardHeader className="bg-muted/10 border-b pb-4">
          <CardTitle className="text-lg">
            Registered Branches ({branches?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-24">Code</TableHead>
                  <TableHead>Branch Name</TableHead>
                  <TableHead className="w-32 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branches.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center h-32 text-muted-foreground"
                    >
                      No branches found in the system.
                    </TableCell>
                  </TableRow>
                ) : (
                  branches.map((branch: Branch) => (
                    <TableRow key={branch.id}>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="font-mono text-xs bg-primary/5"
                        >
                          {branch.code}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {branch.name}
                      </TableCell>
                      <TableCell className="text-right">
                        {canUpdate ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setBranchToEdit(branch)}
                          >
                            <Edit className="w-4 h-4 mr-2" /> Edit
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            Read-only
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Render the Edit Modal dynamically */}
      <BranchEditModal
        isOpen={!!branchToEdit}
        onClose={() => setBranchToEdit(null)}
        branch={branchToEdit}
      />
    </div>
  );
}
