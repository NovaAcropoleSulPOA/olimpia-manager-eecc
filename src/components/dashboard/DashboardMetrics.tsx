import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BranchAnalytics } from "@/lib/api";
import { Users, Medal, Clock, Wallet } from "lucide-react";

interface DashboardMetricsProps {
  data: BranchAnalytics[];
}

export function DashboardMetrics({ data }: DashboardMetricsProps) {
  // Calculate totals from the analytics data
  const totalAthletes = data.reduce((acc, branch) => acc + (branch.total_inscritos || 0), 0);
  const totalRevenuePaid = data.reduce((acc, branch) => acc + (branch.valor_total_pago || 0), 0);
  const totalRevenuePending = data.reduce((acc, branch) => acc + (branch.valor_total_pendente || 0), 0);
  const totalAthletesPendingPayment = data.reduce((acc, branch) => acc + (branch.total_atletas_pagamento_pendente || 0), 0);

  console.log('Dashboard metrics:', {
    totalAthletes,
    totalRevenuePaid,
    totalRevenuePending,
    totalAthletesPendingPayment
  });

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-olimpics-text">
            Total de Atletas
          </CardTitle>
          <Users className="h-4 w-4 text-olimpics-green-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-olimpics-text">{totalAthletes}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Total de atletas inscritos
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
            Atletas com Pagamento Pendente
          </CardTitle>
          <Clock className="h-4 w-4 text-olimpics-green-secondary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-olimpics-text">{totalAthletesPendingPayment}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Atletas aguardando confirmação
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