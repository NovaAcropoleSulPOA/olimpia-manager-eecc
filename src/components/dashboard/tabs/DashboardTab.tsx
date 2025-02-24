
import { DashboardMetrics } from "../DashboardMetrics";
import { DashboardCharts } from "../DashboardCharts";
import { BranchAnalytics } from "@/lib/api";

interface DashboardTabProps {
  branchAnalytics: BranchAnalytics[];
}

export function DashboardTab({ branchAnalytics }: DashboardTabProps) {
  console.log('Raw analytics data:', branchAnalytics); // Debug log

  // Filter out any invalid entries and ensure we have proper data
  const validAnalytics = branchAnalytics.filter(branch => 
    branch && 
    branch.filial_id && 
    typeof branch.total_inscritos_geral !== 'undefined'
  );

  console.log('Filtered analytics data:', validAnalytics); // Debug log

  return (
    <div className="grid gap-6">
      <DashboardMetrics data={validAnalytics} />
      <DashboardCharts data={validAnalytics} />
    </div>
  );
}
