
import { BranchAnalytics } from "@/lib/api";
import { PaymentStatus } from "./types";

export function useMetricsData(data: BranchAnalytics[]) {
  // Calculate total unique athletes (using total_inscritos_geral)
  const totalAthletes = data.reduce((acc, branch) => 
    acc + (branch.total_inscritos_geral || 0), 0
  );
  
  // Calculate payment status totals from the JSON field
  const paymentTotals = data.reduce((acc, branch) => {
    const statusData: PaymentStatus[] = branch.total_inscritos_por_status || [];
    
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

  // Now we'll calculate the pending revenue
  // This is a placeholder - you might want to add valor_total_pendente to the view
  // For now, we'll show 0
  const totalRevenuePending = 0;

  return {
    totalAthletes,
    totalRevenuePaid,
    totalRevenuePending,
    totalAthletesPendingPayment: paymentTotals.pending
  };
}
