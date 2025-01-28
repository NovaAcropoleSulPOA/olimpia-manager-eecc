import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BranchAnalytics } from "@/lib/api";
import { Users, Medal, Building2 } from "lucide-react";

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

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Atletas</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalAthletes}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Modalidades Ativas</CardTitle>
          <Medal className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalModalities}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Filiais Ativas</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeBranches}</div>
        </CardContent>
      </Card>
    </div>
  );
}