import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BranchAnalytics } from "@/lib/api";
import { Users, Medal, Building2, Wallet } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";

interface DashboardMetricsProps {
  data: BranchAnalytics[];
}

export function DashboardMetrics({ data }: DashboardMetricsProps) {
  const totalAthletes = data.reduce((acc, branch) => acc + (branch.total_inscritos || 0), 0);
  const activeBranches = data.length;
  
  // Calculate total unique modalities across all branches
  const uniqueModalities = new Set();
  data.forEach(branch => {
    if (branch.modalidades_populares) {
      Object.keys(branch.modalidades_populares).forEach(modalidade => {
        uniqueModalities.add(modalidade);
      });
    }
  });
  const totalModalities = uniqueModalities.size;

  // Calculate total revenue
  const totalRevenue = data.reduce((acc, branch) => {
    return acc + (branch.valor_total_arrecadado || 0);
  }, 0);

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-olimpics-text">
            Total de Atletas Pagantes
          </CardTitle>
          <Users className="h-4 w-4 text-olimpics-green-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-olimpics-text">{totalAthletes}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Atletas com pagamento confirmado
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-olimpics-text">
            Modalidades Ativas
          </CardTitle>
          <Medal className="h-4 w-4 text-olimpics-orange-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-olimpics-text">{totalModalities}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Total de modalidades com inscrições
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-olimpics-text">
            Filiais Ativas
          </CardTitle>
          <Building2 className="h-4 w-4 text-olimpics-green-secondary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-olimpics-text">{activeBranches}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Filiais com atletas inscritos
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-olimpics-text">
            Valor Total Arrecadado
          </CardTitle>
          <Wallet className="h-4 w-4 text-olimpics-orange-secondary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-olimpics-text">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(totalRevenue)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Total de pagamentos confirmados
          </p>
        </CardContent>
      </Card>
    </div>
  );
}