
export interface ChartBranchData {
  name: string;
  totalGeral: number;
  totalModalidades: number;
  confirmados: number;
  pendentes: number;
  cancelados: number;
}

export interface PaymentStatusData {
  name: string;
  value: number;
  color: string;
}

export interface TooltipData {
  active?: boolean;
  payload?: any[];
  label?: string;
}
