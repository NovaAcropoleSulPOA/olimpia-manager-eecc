
import { BranchAnalytics } from "@/types/api";

export function calculateTotals(filteredData: BranchAnalytics[]) {
  return filteredData.reduce((acc, branch) => ({
    inscricoes: acc.inscricoes + Number(branch.total_inscritos_geral || 0),
    pago: acc.pago + Number(branch.valor_total_pago || 0),
    pendente: acc.pendente + Number(branch.valor_total_pendente || 0)
  }), { inscricoes: 0, pago: 0, pendente: 0 });
}

export function transformModalitiesData(filteredData: BranchAnalytics[]) {
  return filteredData.flatMap(branch => {
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
  .filter(item => item.name && item.count > 0)
  .slice(0, 6)
  .sort((a, b) => b.count - a.count);
}

export function transformPaymentStatusData(filteredData: BranchAnalytics[], paymentStatusColors: Record<string, string>) {
  return filteredData.flatMap(branch => {
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

export function transformCategoriesData(filteredData: BranchAnalytics[]) {
  return filteredData.flatMap(branch => {
    if (!branch.atletas_por_categoria || !Array.isArray(branch.atletas_por_categoria)) {
      console.warn('atletas_por_categoria is not an array:', branch.atletas_por_categoria);
      return [];
    }
    
    return branch.atletas_por_categoria.map(item => {
      if (!item || typeof item !== 'object') {
        console.warn('Invalid category item:', item);
        return null;
      }
      return {
        categoria: item.categoria || 'Desconhecida',
        quantidade: Number(item.quantidade) || 0
      };
    }).filter(Boolean); // Remove null items
  })
  .reduce((acc, curr) => {
    if (!curr || !curr.categoria) return acc;
    
    const existing = acc.find(item => item.categoria === curr.categoria);
    if (existing) {
      existing.quantidade += curr.quantidade;
    } else {
      acc.push({ ...curr });
    }
    return acc;
  }, [] as any[])
  .sort((a, b) => b.quantidade - a.quantidade)
  .slice(0, 6)
  .filter(item => item.quantidade > 0); // Only include items with values
}
