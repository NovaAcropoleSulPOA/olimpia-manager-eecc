
import { Users, Medal, Clock, Wallet } from "lucide-react";
import { DashboardMetricsProps } from "./metrics/types";
import { MetricCard } from "./metrics/MetricCard";
import { useMetricsData } from "./metrics/useMetricsData";

export function DashboardMetrics({ data }: DashboardMetricsProps) {
  const {
    totalAthletes,
    totalRevenuePaid,
    totalRevenuePending,
    totalAthletesPendingPayment
  } = useMetricsData(data);

  const metrics = [
    {
      title: "Total de Inscrições",
      value: totalAthletes,
      description: "Total de inscritos",
      icon: <Users className="h-4 w-4 text-olimpics-green-primary" />
    },
    {
      title: "Pagamentos Confirmados",
      value: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(totalRevenuePaid),
      description: "Total de pagamentos confirmados",
      icon: <Medal className="h-4 w-4 text-olimpics-orange-primary" />
    },
    {
      title: "Inscrições com Pagamento Pendente",
      value: totalAthletesPendingPayment,
      description: "Inscrições aguardando confirmação",
      icon: <Clock className="h-4 w-4 text-olimpics-green-secondary" />
    },
    {
      title: "Pagamentos Pendentes",
      value: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(totalRevenuePending),
      description: "Total de pagamentos pendentes",
      icon: <Wallet className="h-4 w-4 text-olimpics-orange-secondary" />
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
}
