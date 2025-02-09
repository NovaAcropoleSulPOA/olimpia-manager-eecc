import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BranchAnalytics } from "@/lib/api";
import { Users, Medal, Clock, Wallet } from "lucide-react";

interface DashboardMetricsProps {
  data: BranchAnalytics[];
}

interface PaymentStatus {
  status_pagamento: string;
  quantidade: number;
}

export function DashboardMetrics({ data }: DashboardMetricsProps) {
  // Calculate totals from the analytics data
  const totalAthletes = data.reduce((acc, branch) => acc + (branch.total_inscritos || 0), 0);
  
  // Calculate revenue totals
  const totalRevenuePaid = data.reduce((acc, branch) => acc + (branch.valor_total_pago || 0), 0);
  const totalRevenuePending = data.reduce((acc, branch) => {
    // Only count pending payments if there are actually pending athletes
    let pendingStatus: PaymentStatus | undefined;
    
    try {
      if (typeof branch.inscritos_por_status_pagamento === 'string') {
        const parsed = JSON.parse(branch.inscritos_por_status_pagamento);
        pendingStatus = parsed.find(
          (status: PaymentStatus) => status.status_pagamento === 'pendente'
        );
      } else if (Array.isArray(branch.inscritos_por_status_pagamento)) {
        pendingStatus = branch.inscritos_por_status_pagamento.find(
          (status: PaymentStatus) => status.status_pagamento === 'pendente'
        );
      }
    } catch (error) {
      console.error('Error parsing payment status:', error);
    }
    
    return pendingStatus ? acc + (branch.valor_total_pendente || 0) : acc;
  }, 0);
  
  // Calculate pending payments count - ensure we only count actual pending payments
  const totalAthletesPendingPayment = data.reduce((acc, branch) => {
    let pendingStatus: PaymentStatus | undefined;
    
    try {
      if (typeof branch.inscritos_por_status_pagamento === 'string') {
        const parsed = JSON.parse(branch.inscritos_por_status_pagamento);
        pendingStatus = parsed.find(
          (status: PaymentStatus) => status.status_pagamento === 'pendente'
        );
      } else if (Array.isArray(branch.inscritos_por_status_pagamento)) {
        pendingStatus = branch.inscritos_por_status_pagamento.find(
          (status: PaymentStatus) => status.status_pagamento === 'pendente'
        );
      }
    } catch (error) {
      console.error('Error parsing payment status:', error);
    }
    
    console.log('Branch pending payments:', {
      branchId: branch.filial_id,
      branchName: branch.filial,
      pendingCount: pendingStatus?.quantidade || 0,
      rawData: branch.inscritos_por_status_pagamento
    });
    
    return acc + (pendingStatus?.quantidade || 0);
  }, 0);

  console.log('Dashboard metrics calculated:', {
    totalAthletes,
    totalRevenuePaid,
    totalRevenuePending,
    totalAthletesPendingPayment,
    rawData: data
  });

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-olimpics-text">
            Total de Inscrições
          </CardTitle>
          <Users className="h-4 w-4 text-olimpics-green-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-olimpics-text">{totalAthletes}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Total de inscritos
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-olimpics-text">
            Pagamentos Confirmados
          </CardTitle>
          <Medal className="h-4 w-4 text-olimpics-orange-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-olimpics-text">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(totalRevenuePaid)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Total de pagamentos confirmados
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-olimpics-text">
            Inscrições com Pagamento Pendente
          </CardTitle>
          <Clock className="h-4 w-4 text-olimpics-green-secondary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-olimpics-text">{totalAthletesPendingPayment}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Inscrições aguardando confirmação
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-olimpics-text">
            Pagamentos Pendentes
          </CardTitle>
          <Wallet className="h-4 w-4 text-olimpics-orange-secondary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-olimpics-text">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(totalRevenuePending)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Total de pagamentos pendentes
          </p>
        </CardContent>
      </Card>
    </div>
  );
}