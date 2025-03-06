
import { BranchAnalytics } from "@/types/api";
import { BranchRegistrationData } from "./BranchRegistrationsChart";

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
  
  // Collect all modalities from all branches
  const modalitiesMap = new Map<string, {
    name: string;
    branches: Map<string, { confirmed: number; pending: number; }>
  }>();
  
  filteredData.forEach(branch => {
    // Check if modalidades_populares exists and is an array
    if (!branch.modalidades_populares || !Array.isArray(branch.modalidades_populares)) {
      console.warn('modalidades_populares is not an array:', branch.modalidades_populares);
      return;
    }
    
    branch.modalidades_populares.forEach(item => {
      if (!item || typeof item !== 'object') {
        console.warn('Invalid modality item:', item);
        return;
      }
      
      const modalidade = item.modalidade || 'Desconhecida';
      // Use the filial from the item if available, otherwise use the branch name
      const filialName = item.filial || branch.filial || 'Desconhecida';
      const status = item.status_pagamento || 'pendente';
      const count = Number(item.total_inscritos) || 0;
      
      if (!modalitiesMap.has(modalidade)) {
        modalitiesMap.set(modalidade, {
          name: modalidade,
          branches: new Map()
        });
      }
      
      const modalityData = modalitiesMap.get(modalidade)!;
      
      if (!modalityData.branches.has(filialName)) {
        modalityData.branches.set(filialName, { confirmed: 0, pending: 0 });
      }
      
      const branchData = modalityData.branches.get(filialName)!;
      
      if (status === 'confirmado') {
        branchData.confirmed += count;
      } else {
        branchData.pending += count;
      }
    });
  });
  
  // Convert the map to an array and format for the chart
  return Array.from(modalitiesMap.values())
    .map(item => {
      // Sum up totals for each branch
      let total = 0;
      const branchData: { [key: string]: number } = {};
      
      item.branches.forEach((data, branchName) => {
        const branchTotal = data.confirmed + data.pending;
        branchData[branchName] = branchTotal;
        total += branchTotal;
      });
      
      return {
        name: item.name,
        total,
        ...branchData
      };
    })
    .filter(item => item.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 6); // Limit to top 6
}

export function transformPaymentStatusData(filteredData: BranchAnalytics[], paymentStatusColors: Record<string, string>) {
  // Early return if no data
  if (!filteredData || filteredData.length === 0) return [];
  
  const statusTotals = { confirmado: 0, pendente: 0, cancelado: 0 };
  
  filteredData.forEach(branch => {
    // Check if inscritos_por_status_pagamento exists and is an array
    if (!branch.inscritos_por_status_pagamento || !Array.isArray(branch.inscritos_por_status_pagamento)) {
      console.warn('inscritos_por_status_pagamento is not an array:', branch.inscritos_por_status_pagamento);
      return;
    }
    
    branch.inscritos_por_status_pagamento.forEach(item => {
      if (!item || typeof item !== 'object') {
        console.warn('Invalid payment status item:', item);
        return;
      }
      
      const status = item.status_pagamento as keyof typeof statusTotals;
      if (status in statusTotals) {
        statusTotals[status] += Number(item.quantidade) || 0;
      }
    });
  });
  
  return Object.entries(statusTotals)
    .map(([status, value]) => ({
      name: status,
      value,
      color: paymentStatusColors[status as keyof typeof paymentStatusColors] || '#6366F1'
    }))
    .filter(item => item.value > 0);
}

export function transformBranchRegistrationsData(filteredData: BranchAnalytics[]): BranchRegistrationData[] {
  // Early return if no data
  if (!filteredData || filteredData.length === 0) return [];
  
  // Extract registros_por_filial from the first branch (should contain all branches for the event)
  let allBranchRegistrations: any[] = [];
  
  if (filteredData.length > 0 && filteredData[0].registros_por_filial && Array.isArray(filteredData[0].registros_por_filial)) {
    allBranchRegistrations = filteredData[0].registros_por_filial;
  }
  
  // Process the data
  const branchMap = new Map<string, BranchRegistrationData>();
  
  allBranchRegistrations.forEach(item => {
    if (!item || typeof item !== 'object') {
      console.warn('Invalid branch registration item:', item);
      return;
    }
    
    const branchName = item.filial_nome || 'Desconhecida';
    const status = item.status_pagamento || 'pendente';
    const count = Number(item.quantidade) || 0;
    
    if (!branchMap.has(branchName)) {
      branchMap.set(branchName, {
        name: branchName,
        confirmados: 0,
        pendentes: 0,
        total: 0
      });
    }
    
    const branchData = branchMap.get(branchName)!;
    
    if (status === 'confirmado') {
      branchData.confirmados += count;
    } else if (status === 'pendente') {
      branchData.pendentes += count;
    }
    
    branchData.total += count;
  });
  
  return Array.from(branchMap.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 10); // Limit to top 10 branches for readability
}
