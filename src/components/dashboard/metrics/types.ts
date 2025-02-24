
import { BranchAnalytics } from "@/lib/api";

export interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
}

export interface DashboardMetricsProps {
  data: BranchAnalytics[];
}

export interface PaymentStatus {
  status_pagamento: string;
  quantidade: number;
}
