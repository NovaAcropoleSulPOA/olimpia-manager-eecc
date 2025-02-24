
import { BranchAnalytics } from "@/lib/api";

export function useMetricsData(data: BranchAnalytics[]) {
  // Calculate total unique athletes (using total_inscritos which is already deduplicated in the view)
  const totalAthletes = data.reduce((acc, branch) => acc + (branch.total_inscritos || 0), 0);
  
  // Calculate payment status totals
  const paymentTotals = data.reduce((acc, branch) => {
    const statusData = branch.inscritos_por_status_pagamento || [];
    
    statusData.forEach(({ status_pagamento, quantidade }) => {
      if (status_pagamento === 'confirmado') {
        acc.confirmed += quantidade;
      } else if (status_pagamento === 'pendente') {
        acc.pending += quantidade;
      }
    });
    
    return acc;
  }, { confirmed: 0, pending: 0 });

  // Calculate revenue totals from the view's aggregated data
  const totalRevenuePaid = data.reduce((acc, branch) => 
    acc + (branch.valor_total_pago || 0), 0
  );
  
  // Calculate pending revenue from payment status
  const totalRevenuePending = data.reduce((acc, branch) => {
    const pendingPayments = branch.inscritos_por_status_pagamento?.find(
      status => status.status_pagamento === 'pendente'
    );
    return acc + (pendingPayments?.quantidade || 0);
  }, 0);

  return {
    totalAthletes,
    totalRevenuePaid,
    totalRevenuePending,
    totalAthletesPendingPayment: paymentTotals.pending
  };
}
