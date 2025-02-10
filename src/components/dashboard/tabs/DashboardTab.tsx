
import { DashboardMetrics } from "../DashboardMetrics";
import { DashboardCharts } from "../DashboardCharts";

interface DashboardTabProps {
  data: any[];
}

export const DashboardTab = ({ data }: DashboardTabProps) => {
  return (
    <div className="grid gap-6">
      <DashboardMetrics data={data} />
      <DashboardCharts data={data} />
    </div>
  );
};
