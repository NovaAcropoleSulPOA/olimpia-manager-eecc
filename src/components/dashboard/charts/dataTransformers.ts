
import { BranchAnalytics } from "@/types/api";

export function calculateTotals(filteredData: BranchAnalytics[]) {
  return filteredData.reduce((acc, branch) => ({
    inscricoes: acc.inscricoes + Number(branch.total_inscritos_geral || 0),
    pago: acc.pago + Number(branch.valor_total_pago || 0),
    pendente: acc.pendente + Number(branch.valor_total_pendente || 0)
  }), { inscricoes: 0, pago: 0, pendente: 0 });
}

export function transformModalitiesData(filteredData: BranchAnalytics[]) {
  // Early return if no data
  if (!filteredData || filteredData.length === 0) return [];
  
  return filteredData.flatMap(branch => {
    // Check if modalidades_populares exists and is an array
    if (!branch.modalidades_populares || !Array.isArray(branch.modalidades_populares)) {
      console.warn('modalidades_populares is not an array:', branch.modalidades_populares);
      return [];
    }
    
    return branch.modalidades_populares.map(item => {
      if (!item || typeof item !== 'object') {
        console.warn('Invalid modality item:', item);
        return null;
      }
      return {
        name: item.modalidade || 'Desconhecida',
        count: Number(item.total_inscritos) || 0
      };
    }).filter(Boolean); // Remove null items
  })
  .filter(item => item && item.name && item.count > 0)  // Only include items with actual values
  .reduce((acc, curr) => {
    const existing = acc.find(item => item.name === curr.name);
    if (existing) {
      existing.count += curr.count;
    } else {
      acc.push({ ...curr });
    }
    return acc;
  }, [] as any[])
  .sort((a, b) => b.count - a.count)
  .slice(0, 6);  // Limit to top 6
}

export function transformPaymentStatusData(filteredData: BranchAnalytics[], paymentStatusColors: Record<string, string>) {
  // Early return if no data
  if (!filteredData || filteredData.length === 0) return [];
  
  return filteredData.flatMap(branch => {
    // Check if inscritos_por_status_pagamento exists and is an array
    if (!branch.inscritos_por_status_pagamento || !Array.isArray(branch.inscritos_por_status_pagamento)) {
      console.warn('inscritos_por_status_pagamento is not an array:', branch.inscritos_por_status_pagamento);
      return [];
    }
    
    return branch.inscritos_por_status_pagamento.map(item => {
      if (!item || typeof item !== 'object') {
        console.warn('Invalid payment status item:', item);
        return null;
      }
      return {
        status_pagamento: item.status_pagamento || 'Desconhecido',
        quantidade: Number(item.quantidade) || 0
      };
    }).filter(Boolean); // Remove null items
  })
  .reduce((acc, curr) => {
    if (!curr || !curr.status_pagamento) return acc;
    
    const existing = acc.find(item => item.status_pagamento === curr.status_pagamento);
    if (existing) {
      existing.quantidade += curr.quantidade;
    } else {
      acc.push({ ...curr });
    }
    return acc;
  }, [] as any[])
  .sort((a, b) => b.quantidade - a.quantidade)
  .map(item => ({
    name: item.status_pagamento,
    value: item.quantidade,
    color: paymentStatusColors[item.status_pagamento as keyof typeof paymentStatusColors] || '#6366F1'
  }))
  .filter(item => item.value > 0); // Only include items with values
}

export function transformBranchRegistrationsData(filteredData: BranchAnalytics[]) {
  // Early return if no data
  if (!filteredData || filteredData.length === 0) return [];
  
  // Extract registros_por_filial from all branches and flatten
  return filteredData.flatMap(branch => {
    if (!branch.registros_por_filial || !Array.isArray(branch.registros_por_filial)) {
      console.warn('registros_por_filial is not an array:', branch.registros_por_filial);
      return [];
    }
    
    return branch.registros_por_filial.map(item => {
      if (!item || typeof item !== 'object') {
        console.warn('Invalid branch registration item:', item);
        return null;
      }
      return {
        filial_nome: item.filial_nome || 'Desconhecida',
        status_pagamento: item.status_pagamento || 'Desconhecido',
        quantidade: Number(item.quantidade) || 0
      };
    }).filter(Boolean); // Remove null items
  });
}
