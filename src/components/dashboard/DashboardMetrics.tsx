import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BranchAnalytics } from "@/lib/api";

interface DashboardMetricsProps {
  data: BranchAnalytics[];
}

export function DashboardMetrics({ data }: DashboardMetricsProps) {
  const totalRevenue = data.reduce((acc, branch) => acc + (branch.valor_total_arrecadado || 0), 0);
  const totalAthletes = data.reduce((acc, branch) => acc + (branch.total_inscritos || 0), 0);
  const activeBranches = data.length;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(totalRevenue)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Atletas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalAthletes}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Filiais Ativas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeBranches}</div>
        </CardContent>
      </Card>
    </div>
  );
}