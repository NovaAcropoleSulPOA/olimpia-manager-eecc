
import { DashboardMetrics } from "./DashboardMetrics";
import { DashboardCharts } from "./DashboardCharts";
import { BranchAnalytics } from "@/lib/api";

interface DashboardTabProps {
  branchAnalytics: BranchAnalytics[];
}

export function DashboardTab({ branchAnalytics }: DashboardTabProps) {
  // Filter out any potential null or invalid entries
  const validAnalytics = branchAnalytics.filter(branch => 
    branch && typeof branch.total_inscritos_geral === 'number'
  );

  return (
    <div className="grid gap-6">
      <DashboardMetrics data={validAnalytics} />
      <DashboardCharts data={validAnalytics} />
    </div>
  );
}
