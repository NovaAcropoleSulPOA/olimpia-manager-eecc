
import { BranchAnalytics } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { BranchRegistrationsChart } from "./charts/BranchRegistrationsChart";
import { PaymentStatusChart } from "./charts/PaymentStatusChart";
import { ModalitiesTable } from "./ModalitiesTable";

interface DashboardChartsProps {
  data: BranchAnalytics[];
}

export function DashboardCharts({ data }: DashboardChartsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <BranchRegistrationsChart data={data} />
      <PaymentStatusChart data={data} />
      <Card className="col-span-2">
        <ModalitiesTable data={data} />
      </Card>
    </div>
  );
}
