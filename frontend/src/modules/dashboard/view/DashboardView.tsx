import { useDashboardViewModel } from "../viewModel/useDashboardViewModel";
import { Users, Shield, Activity, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { format } from "date-fns";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function DashboardView() {
  const vm = useDashboardViewModel();

  if (vm.isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
        <Skeleton className="h-100  rounded-xl" />
      </div>
    );
  }

  if (vm.isError || !vm.metrics) {
    return (
      <div className="p-6 text-destructive text-center mt-10">
        Failed to load dashboard data.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {vm.user?.firstName}!
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Here is what's happening in your {vm.roleType.replace("_", " ")}{" "}
          portal today.
        </p>
      </div>

      {/* ========================================== */}
      {/* 👑 SUPER ADMIN DASHBOARD */}
      {/* ========================================== */}
      {vm.metrics.type === "SUPER_ADMIN" && (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Users"
              value={vm.metrics.stats.totalUsers}
              icon={<Users />}
            />
            <StatCard
              title="System Roles"
              value={vm.metrics.stats.totalRoles}
              icon={<Shield />}
            />
            <StatCard
              title="Active Sessions"
              value={vm.metrics.stats.activeSessions}
              icon={<Activity />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Role Distribution Chart */}
            <div className="border rounded-xl bg-card p-6 shadow-sm flex flex-col items-center">
              <h3 className="font-semibold w-full text-left mb-4">
                Role Distribution
              </h3>
              <div className="w-full h-75">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={vm.metrics.roleDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {vm.metrics.roleDistribution.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Audit Logs */}
            <div className="border rounded-xl bg-card p-6 shadow-sm overflow-hidden">
              <h3 className="font-semibold mb-4">Recent Security Audits</h3>
              <div className="space-y-4">
                {vm.metrics.recentActivity.map((log) => (
                  <div
                    key={log.id}
                    className="flex justify-between items-start border-b pb-3 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">{log.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {log.user}
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-4">
                      {format(new Date(log.date), "MMM dd, hh:mm a")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 👨‍🏫 PROFESSOR DASHBOARD */}
      {/* ========================================== */}
      {vm.metrics.type === "PROFESSOR" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="My Assigned Subjects"
              value={vm.metrics.stats.totalSubjects}
              icon={<BookOpen />}
            />
          </div>

          <div className="border rounded-xl bg-card p-6 shadow-sm">
            <h3 className="font-semibold mb-4">Current Workload</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {vm.metrics.mySubjects.map((sub) => (
                <div key={sub.id} className="p-4 border rounded-lg bg-muted/20">
                  <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded-md">
                    {sub.code}
                  </span>
                  <h4 className="font-semibold mt-2">{sub.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1 uppercase">
                    Sem {sub.semester}
                  </p>
                </div>
              ))}
              {vm.metrics.mySubjects.length === 0 && (
                <p className="text-sm text-muted-foreground col-span-full">
                  No subjects assigned for this term.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Component for Stat Cards
function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="p-6 border rounded-xl bg-card shadow-sm flex items-center gap-4">
      <div className="p-4 bg-primary/10 text-primary rounded-lg">{icon}</div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <h3 className="text-2xl font-bold">{value}</h3>
      </div>
    </div>
  );
}
