import { useNavigate } from "react-router-dom";
import { Settings, Plus, Edit, Database } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

import { PageBreadcrumb } from "@/components/custom/dashboard/PageBreadcrumb";
import { EnumCategory } from "../types/enum.schemas";
import { useEnumManagementViewModel } from "../viewModel/useEnumManagementViewModel";

import { EnumCreateModal } from "./EnumCreateModal";
import { EnumEditModal } from "./EnumEditModal";

export default function EnumManagementView() {
  const navigate = useNavigate();
  const vm = useEnumManagementViewModel();

  if (!vm.canManageSettings) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-xl font-bold text-red-500">Access Denied</h2>
        <p className="text-muted-foreground mt-2">
          You do not have permission to manage system configurations.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate("/")}
        >
          Go to Dashboard
        </Button>
      </div>
    );
  }

  const tabs = [
    { label: "Semesters", value: EnumCategory.SEMESTER },
    { label: "Academic Years", value: EnumCategory.ACADEMIC_YEAR },
    { label: "Genders", value: EnumCategory.GENDER },
    { label: "Account Status", value: EnumCategory.ACCOUNT_STATUS },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      <PageBreadcrumb
        items={[
          { label: "Dashboard", onClick: () => navigate("/") },
          { label: "System Configurations" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Settings className="w-8 h-8 text-primary" />
            System Constants (Enums)
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage global dropdown values and system classifications.
          </p>
        </div>
        <Button onClick={() => vm.setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add New Value
        </Button>
      </div>

      <Tabs
        value={vm.activeCategory}
        onValueChange={(val) => vm.setActiveCategory(val as EnumCategory)}
        className="space-y-6"
      >
        <div className="bg-muted/30 p-1.5 rounded-lg border inline-flex w-full overflow-x-auto">
          <TabsList className="bg-transparent h-auto p-0 gap-2 w-full justify-start">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-6 py-2.5 rounded-md text-sm transition-all whitespace-nowrap"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* We use a single mapped TabsContent since the UI structure is identical for every category */}
        {tabs.map((tab) => (
          <TabsContent
            key={tab.value}
            value={tab.value}
            className="m-0 focus-visible:outline-none"
          >
            <Card className="shadow-sm border-primary/10">
              <CardHeader className="bg-muted/10 border-b pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Database className="w-5 h-5 text-muted-foreground" />
                  {tab.label} Database
                </CardTitle>
                <CardDescription>
                  Values loaded directly from the system cache.
                </CardDescription>
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
                        <TableHead className="w-[30%]">Internal Key</TableHead>
                        <TableHead className="w-[50%]">Display Value</TableHead>
                        <TableHead className="w-[20%] text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vm.enums.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className="text-center h-32 text-muted-foreground"
                          >
                            No values configured for this category.
                          </TableCell>
                        </TableRow>
                      ) : (
                        vm.enums.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className="font-mono bg-primary/10 text-primary"
                              >
                                {item.key}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium text-foreground">
                              {item.value}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => vm.openEditModal(item)}
                              >
                                <Edit className="w-4 h-4 mr-2 text-blue-600" />{" "}
                                Edit
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
          </TabsContent>
        ))}
      </Tabs>

      {/* RENDER MODALS */}
      <EnumCreateModal vm={vm} />
      <EnumEditModal vm={vm} />
    </div>
  );
}
