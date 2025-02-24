
import { DashboardMetrics } from "../DashboardMetrics";
import { DashboardCharts } from "../DashboardCharts";
import { BranchAnalytics } from "@/lib/api";

interface DashboardTabProps {
  branchAnalytics: BranchAnalytics[];
}

export function DashboardTab({ branchAnalytics }: DashboardTabProps) {
  return (
    <div className="grid gap-6">
      <DashboardMetrics data={branchAnalytics} />
      <DashboardCharts data={branchAnalytics} />
    </div>
  );
}
