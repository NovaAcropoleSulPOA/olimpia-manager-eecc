
import { BranchAnalytics } from "@/lib/api";

export function useMetricsData(data: BranchAnalytics[]) {
  // Calculate total unique athletes (using total_inscritos_geral)
  const totalAthletes = data.reduce((acc, branch) => acc + (branch.total_inscritos_geral || 0), 0);
  
  // Calculate payment status totals
  const paymentTotals = data.reduce((acc, branch) => {
    const statusData = branch.total_inscritos_por_status || [];
    
    statusData.forEach(({ status_pagamento, quantidade }) => {
      if (status_pagamento === 'confirmado') {
        acc.confirmed += quantidade;
      } else if (status_pagamento === 'pendente') {
        acc.pending += quantidade;
      }
    });
    
    return acc;
  }, { confirmed: 0, pending: 0 });

  // Calculate revenue totals
  const totalRevenuePaid = data.reduce((acc, branch) => 
    acc + (branch.valor_total_pago || 0), 0
  );
  
  // Since valor_total_pendente is no longer in the view, we calculate it from status
  const totalRevenuePending = 0; // Removed as per new view structure

  return {
    totalAthletes,
    totalRevenuePaid,
    totalRevenuePending,
    totalAthletesPendingPayment: paymentTotals.pending
  };
}
