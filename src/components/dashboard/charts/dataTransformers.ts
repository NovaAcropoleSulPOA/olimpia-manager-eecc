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
 */
export function transformModalitiesData(data: BranchAnalytics[]) {
  const transformedData: any[] = [];

  data.forEach(branchData => {
    branchData.modalidades_populares.forEach(modalidade => {
      // Find if the modality already exists in the transformed data
      const existingModalidade = transformedData.find(item => item.name === modalidade.modalidade);

      if (existingModalidade) {
        // If the modality exists, update the count for the current branch
        existingModalidade[branchData.filial] = modalidade.total_inscritos;
        existingModalidade.total += modalidade.total_inscritos;
      } else {
        // If the modality doesn't exist, create a new entry
        const newModalidade: any = {
          name: modalidade.modalidade,
          total: modalidade.total_inscritos,
        };
        newModalidade[branchData.filial] = modalidade.total_inscritos;
        transformedData.push(newModalidade);
      }
    });
  });

  // Sort the transformed data by total registrations
  transformedData.sort((a, b) => b.total - a.total);

  return transformedData;
}

/**
 * Transforms the analytics data to properly format payment status for charts
 */
export function transformPaymentStatusData(data: any[], colorMap: Record<string, string>) {
  // Extract and aggregate payment status data
  const statusCounts: Record<string, number> = {};
  
  data.forEach(branchData => {
    if (branchData.inscritos_por_status_pagamento && Array.isArray(branchData.inscritos_por_status_pagamento)) {
      branchData.inscritos_por_status_pagamento.forEach((status: StatusInscricao) => {
        const statusKey = status.status_pagamento.toLowerCase();
        statusCounts[statusKey] = (statusCounts[statusKey] || 0) + status.quantidade;
      });
    }
  });
  
  // Convert to pie chart data format
  return Object.entries(statusCounts).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
    color: colorMap[status] || '#CCCCCC'
  }));
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
