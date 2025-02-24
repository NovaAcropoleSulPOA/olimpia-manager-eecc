
import { BranchAnalytics } from "@/lib/api";
import { BranchRegistrationsChart } from "./charts/BranchRegistrationsChart";
import { PaymentStatusChart } from "./charts/PaymentStatusChart";
import { ModalitiesTable } from "./ModalitiesTable";
import type { ChartBranchData, PaymentStatusData } from "./charts/types";

interface DashboardChartsProps {
  data: BranchAnalytics[];
}

export function DashboardCharts({ data }: DashboardChartsProps) {
  // Transform data for branch registrations and payments
  const branchData: ChartBranchData[] = data
    .filter(branch => branch.filial !== '_Nenhuma_')
    .map(branch => ({
      name: branch.filial,
      totalGeral: branch.total_inscritos_geral || 0,
      totalModalidades: branch.total_inscritos_modalidades || 0,
      pago: branch.valor_total_pago || 0
    }))
    .filter(branch => branch.totalGeral > 0)
    .sort((a, b) => b.totalGeral - a.totalGeral);

  // Transform data for payment status distribution
  const paymentStatusData: PaymentStatusData[] = data.reduce((acc: PaymentStatusData[], branch) => {
    const statusData = branch.total_inscritos_por_status || [];
    statusData.forEach(({ status_pagamento, quantidade }) => {
      if (!status_pagamento || quantidade === 0) return;
      
      const existingStatus = acc.find(item => item.name === status_pagamento);
      if (existingStatus) {
        existingStatus.value += quantidade;
      } else {
        acc.push({ name: status_pagamento, value: quantidade });
      }
    });
    return acc;
  }, [])
  .filter(item => item.value > 0);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <BranchRegistrationsChart data={branchData} />
      <PaymentStatusChart data={paymentStatusData} />
      <div className="col-span-2">
        <ModalitiesTable data={data} />
      </div>
    </div>
  );
}
