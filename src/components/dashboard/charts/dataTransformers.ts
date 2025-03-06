
import { 
  BranchAnalytics, 
  ModalidadePopular, 
  StatusPagamento,
  StatusInscricao
} from "@/types/api";
import { BranchRegistrationData } from "./BranchRegistrationsChart";

/**
 * Calculates the total counts from the analytics data.
 */
export function calculateTotals(data: BranchAnalytics[]) {
  let totalGeral = 0;
  let totalModalidades = 0;
  let totalConfirmados = 0;
  let totalPendentes = 0;
  let totalCancelados = 0;

  data.forEach(branchData => {
    totalGeral += branchData.total_inscritos_geral;
    totalModalidades += branchData.total_inscritos_modalidades;

    // Sum up the counts for each payment status
    branchData.inscritos_por_status_pagamento.forEach(status => {
      if (status.status_pagamento === 'confirmado') {
        totalConfirmados += status.quantidade;
      } else if (status.status_pagamento === 'pendente') {
        totalPendentes += status.quantidade;
      } else if (status.status_pagamento === 'cancelado') {
        totalCancelados += status.quantidade;
      }
    });
  });

  return {
    totalGeral,
    totalModalidades,
    totalConfirmados,
    totalPendentes,
    totalCancelados
  };
}

/**
 * Transforms the analytics data to a format suitable for the modalities chart.
 * Correctly aggregates modalities by branch with accurate counts.
 */
export function transformModalitiesData(data: BranchAnalytics[]) {
  // First, collect all unique modalities across all branches
  const modalityMap = new Map<string, {[branch: string]: number, total: number}>();
  
  // Step 1: Collect all modalities and their counts per branch
  data.forEach(branchData => {
    const branchName = branchData.filial;
    
    branchData.modalidades_populares.forEach(modalidade => {
      const modalityName = modalidade.modalidade;
      
      if (!modalityMap.has(modalityName)) {
        modalityMap.set(modalityName, { total: 0 });
      }
      
      const modalityData = modalityMap.get(modalityName)!;
      modalityData[branchName] = modalidade.total_inscritos;
      modalityData.total += modalidade.total_inscritos;
    });
  });
  
  // Step 2: Convert map to array format for the chart
  const transformedData = Array.from(modalityMap.entries()).map(([modalityName, branchCounts]) => {
    return {
      name: modalityName,
      ...branchCounts
    };
  });
  
  // Step 3: Sort by total count (most popular first)
  return transformedData.sort((a, b) => b.total - a.total);
}

/**
 * Transforms the analytics data for the battery-style payment status chart
 */
export function transformPaymentStatusData(data: any[], colorMap: Record<string, string>) {
  // Extract and aggregate payment status data
  let totalConfirmado = 0;
  let totalPendente = 0;
  let totalCancelado = 0;
  
  data.forEach(branchData => {
    if (branchData.inscritos_por_status_pagamento && Array.isArray(branchData.inscritos_por_status_pagamento)) {
      branchData.inscritos_por_status_pagamento.forEach((status: StatusInscricao) => {
        if (status.status_pagamento === 'confirmado') {
          totalConfirmado += status.quantidade;
        } else if (status.status_pagamento === 'pendente') {
          totalPendente += status.quantidade;
        } else if (status.status_pagamento === 'cancelado') {
          totalCancelado += status.quantidade;
        }
      });
    }
  });
  
  const totalAll = totalConfirmado + totalPendente + totalCancelado;
  
  // For the battery chart we need percentages
  return [
    {
      name: "Status de Pagamento",
      confirmado: totalConfirmado,
      pendente: totalPendente,
      cancelado: totalCancelado,
      total: totalAll,
      // Calculate percentages for the battery visualization
      confirmadoPct: totalAll > 0 ? (totalConfirmado / totalAll) * 100 : 0,
      pendentePct: totalAll > 0 ? (totalPendente / totalAll) * 100 : 0,
      canceladoPct: totalAll > 0 ? (totalCancelado / totalAll) * 100 : 0
    }
  ];
}

/**
 * Transforms the analytics data to a format suitable for the branch registrations chart.
 */
export function transformBranchRegistrationsData(data: BranchAnalytics[]): BranchRegistrationData[] {
  return data.map(branchData => ({
    name: branchData.filial,
    confirmados: branchData.inscritos_por_status_pagamento.find(status => status.status_pagamento === 'confirmado')?.quantidade || 0,
    pendentes: branchData.inscritos_por_status_pagamento.find(status => status.status_pagamento === 'pendente')?.quantidade || 0,
    total: branchData.total_inscritos_geral
  }));
}
