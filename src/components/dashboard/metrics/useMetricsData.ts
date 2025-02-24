
import { BranchAnalytics } from "@/lib/api";

export function useMetricsData(data: BranchAnalytics[]) {
  // Calculate totals from the analytics data
  const totalAthletes = data.reduce((acc, branch) => acc + (branch.total_inscritos || 0), 0);
  
  // Calculate revenue totals
  const totalRevenuePaid = data.reduce((acc, branch) => acc + (branch.valor_total_pago || 0), 0);
  const totalRevenuePending = data.reduce((acc, branch) => acc + (branch.valor_total_pendente || 0), 0);
  
  // Calculate pending payments count
  const totalAthletesPendingPayment = data.reduce((acc, branch) => {
    const statusData = branch.inscritos_por_status_pagamento as { status_pagamento: string; quantidade: number }[];
    const pendingCount = statusData?.find(s => s.status_pagamento === 'pendente')?.quantidade || 0;
    return acc + pendingCount;
  }, 0);

  return {
    totalAthletes,
    totalRevenuePaid,
    totalRevenuePending,
    totalAthletesPendingPayment
  };
}
