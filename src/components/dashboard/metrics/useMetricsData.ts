
import { BranchAnalytics } from "@/lib/api";

export function useMetricsData(data: BranchAnalytics[]) {
  // Calculate total unique athletes from the new structure
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

  // Calculate pending revenue using status quantities and average payment amount
  const averagePaymentAmount = totalRevenuePaid / (paymentTotals.confirmed || 1);
  const totalRevenuePending = paymentTotals.pending * averagePaymentAmount;

  return {
    totalAthletes,
    totalRevenuePaid,
    totalRevenuePending,
    totalAthletesPendingPayment: paymentTotals.pending
  };
}
