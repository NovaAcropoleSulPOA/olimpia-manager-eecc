
import { BranchAnalytics } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Coins, Users } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { ChartContainer, ChartLegendContent } from "@/components/ui/chart";
import { BarChart, XAxis, YAxis, Tooltip, Bar, Legend, PieChart, Pie, Cell } from "recharts";

const CHART_COLORS = ['#10B981', '#F59E0B', '#EF4444', '#6366F1', '#8B5CF6', '#EC4899'];

interface StatisticsTabProps {
  data: BranchAnalytics[];
  currentBranchId?: string;
}

export function StatisticsTab({ data, currentBranchId }: StatisticsTabProps) {
  // Filter data for delegation view if currentBranchId is provided
  const filteredData = currentBranchId 
    ? data.filter(item => item.filial_id === currentBranchId)
    : data;

  // Calculate totals
  const totals = filteredData.reduce((acc, branch) => ({
    inscricoes: acc.inscricoes + Number(branch.total_inscritos || 0),
    pago: acc.pago + Number(branch.valor_total_pago || 0),
    pendente: acc.pendente + Number(branch.valor_total_pendente || 0)
  }), { inscricoes: 0, pago: 0, pendente: 0 });

  // Transform data for popular modalities chart
  const modalitiesData = filteredData.flatMap(branch => 
    Object.entries(branch.modalidades_populares || {})
      .map(([name, count]) => ({ name, count }))
  ).slice(0, 6); // Show top 6 modalities

  // Transform data for payment status chart
  const paymentStatusData = filteredData.flatMap(branch =>
    (branch.inscritos_por_status_pagamento || [])
  ).slice(0, 5);

  // Transform data for categories chart
  const categoriesData = filteredData.flatMap(branch =>
    (branch.atletas_por_categoria || [])
  ).slice(0, 6);

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inscritos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.inscricoes}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pago</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totals.pago)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendente</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(totals.pendente)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Popular Modalities Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Modalidades Populares</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-[300px]" config={{}}>
              <BarChart data={modalitiesData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10B981" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Payment Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Status de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-[300px]" config={{}}>
              <PieChart>
                <Pie
                  data={paymentStatusData}
                  dataKey="quantidade"
                  nameKey="status_pagamento"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {paymentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Categories Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Atletas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-[300px]" config={{}}>
              <BarChart data={categoriesData}>
                <XAxis dataKey="categoria" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantidade" fill="#6366F1" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
