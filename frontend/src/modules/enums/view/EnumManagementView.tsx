import { useNavigate } from "react-router-dom";
import {
  Settings,
  Plus,
  Edit,
  Database,
  Shield,
  CalendarDays,
  Users,
  GraduationCap,
  Tag,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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

// Tab icon mapping
const tabIcons: Record<string, React.ElementType> = {
  [EnumCategory.SEMESTER]: GraduationCap,
  [EnumCategory.ACADEMIC_YEAR]: CalendarDays,
  [EnumCategory.GENDER]: Users,
  [EnumCategory.ACCOUNT_STATUS]: Shield,
};

export default function EnumManagementView() {
  const navigate = useNavigate();
  const vm = useEnumManagementViewModel();

  if (!vm.canManageSettings) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="rounded-2xl border border-dashed border-border/50 bg-muted/10 p-12 text-center max-w-md">
          <div className="h-16 w-16 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center mx-auto mb-5">
            <Shield className="w-7 h-7 text-rose-500" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Access Denied</h2>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            You do not have permission to manage system configurations.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-5 gap-1.5"
            onClick={() => navigate("/")}
          >
            Go to Dashboard
          </Button>
        </div>
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

      {/* ═══════════════════════════════════════
          MAIN CARD
          ═══════════════════════════════════════ */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
        {/* Gradient accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-primary/70 to-primary/40" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                System Constants
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage global dropdown values and system classifications
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => vm.setIsCreateModalOpen(true)}
            className="gap-1.5 w-full sm:w-auto"
          >
            <Plus className="h-3.5 w-3.5" />
            Add New Value
          </Button>
        </div>

        {/* Tabs */}
        <Tabs
          value={vm.activeCategory}
          onValueChange={(val) => vm.setActiveCategory(val as EnumCategory)}
        >
          <div className="px-6 sm:px-8 py-4 border-b bg-muted/10">
            <div className="bg-muted/40 p-1 rounded-xl border border-border/40 inline-flex w-full overflow-x-auto">
              <TabsList className="bg-transparent h-auto p-0 gap-1 w-full justify-start">
                {tabs.map((tab) => {
                  const Icon = tabIcons[tab.value] || Tag;
                  return (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-sm transition-all duration-150 whitespace-nowrap gap-1.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">
                        {tab.label.split(" ")[0]}
                      </span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>
          </div>

          {/* Tab Content */}
          {tabs.map((tab) => {
            const Icon = tabIcons[tab.value] || Tag;
            return (
              <TabsContent
                key={tab.value}
                value={tab.value}
                className="m-0 focus-visible:outline-none"
              >
                {/* Section Header */}
                <div className="px-6 sm:px-8 py-4 border-b bg-muted/5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center">
                      <Database className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        {tab.label}
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        Values loaded from the system cache
                      </p>
                    </div>
                  </div>
                  {!vm.isLoading && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-mono px-2 py-0.5"
                    >
                      {vm.enums.length}{" "}
                      {vm.enums.length === 1 ? "entry" : "entries"}
                    </Badge>
                  )}
                </div>

                {/* Table */}
                {vm.isLoading ? (
                  <div className="p-6 sm:p-8 space-y-4">
                    <Skeleton className="h-10 w-full rounded-lg" />
                    <Skeleton className="h-14 w-full rounded-lg" />
                    <Skeleton className="h-14 w-full rounded-lg" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader className="bg-muted/20">
                      <TableRow>
                        <TableHead className="w-[35%]">
                          <span className="flex items-center gap-1.5">
                            <Tag className="h-3 w-3 opacity-60" />
                            Internal Key
                          </span>
                        </TableHead>
                        <TableHead className="w-[45%]">
                          <span className="flex items-center gap-1.5">
                            <Icon className="h-3 w-3 opacity-60" />
                            Display Value
                          </span>
                        </TableHead>
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
                            className="text-center h-40"
                          >
                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                              <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                                <Database className="h-5 w-5 opacity-40" />
                              </div>
                              <p className="text-sm font-medium">
                                No values configured
                              </p>
                              <p className="text-xs text-muted-foreground/70 mt-1">
                                Click "Add New Value" to create an entry.
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        vm.enums.map((item) => (
                          <TableRow
                            key={item.id}
                            className="transition-colors duration-150 hover:bg-muted/30"
                          >
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="font-mono text-[11px] bg-primary/5 text-primary border-primary/20 px-2.5 py-0.5"
                              >
                                {item.key}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium text-sm text-foreground">
                              {item.value}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => vm.openEditModal(item)}
                                className="gap-1.5 text-muted-foreground hover:text-primary transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                Edit
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>

      {/* RENDER MODALS */}
      <EnumCreateModal vm={vm} />
      <EnumEditModal vm={vm} />
    </div>
  );
}
