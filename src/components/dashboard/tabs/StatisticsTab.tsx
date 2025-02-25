import { BranchAnalytics } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, Coins, Users } from "lucide-react";
import { formatToCurrency } from "@/utils/formatters";
import { ChartContainer, ChartLegendContent } from "@/components/ui/chart";
import { BarChart, XAxis, YAxis, Tooltip, Bar, Legend, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Tooltip as UITooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

// Define a consistent color palette
const CHART_COLORS = {
  green: '#10B981',
  yellow: '#F59E0B',
  red: '#EF4444',
  blue: '#6366F1',
  purple: '#8B5CF6',
  pink: '#EC4899'
};

const PAYMENT_STATUS_COLORS = {
  'confirmado': CHART_COLORS.green,
  'pendente': CHART_COLORS.yellow,
  'cancelado': CHART_COLORS.red
};

// Flatten the chart config to match ChartConfig type
const CHART_CONFIG = {
  modalities: {
    color: CHART_COLORS.blue,
    label: 'Modalidades'
  },
  confirmado: {
    color: CHART_COLORS.green,
    label: 'Confirmado'
  },
  pendente: {
    color: CHART_COLORS.yellow,
    label: 'Pendente'
  },
  cancelado: {
    color: CHART_COLORS.red,
    label: 'Cancelado'
  },
  categories: {
    color: CHART_COLORS.purple,
    label: 'Categorias'
  }
};

interface StatisticsTabProps {
  data: BranchAnalytics[];
  currentBranchId?: string;
}

interface InfoIconProps {
  tooltip: string;
}

const InfoIcon = ({ tooltip }: InfoIconProps) => (
  <TooltipProvider>
    <UITooltip>
      <TooltipTrigger className="ml-2 cursor-help">
        <Activity className="h-4 w-4 text-muted-foreground opacity-70" />
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs text-sm">{tooltip}</p>
      </TooltipContent>
    </UITooltip>
  </TooltipProvider>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border">
        <p className="font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' 
              ? entry.value.toLocaleString()
              : entry.value
            }
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function StatisticsTab({ data, currentBranchId }: StatisticsTabProps) {
  // Filter data for delegation view if currentBranchId is provided
  const filteredData = currentBranchId 
    ? data.filter(item => item.filial_id === currentBranchId)
    : data;

  // Calculate totals
  const totals = filteredData.reduce((acc, branch) => ({
    inscricoes: acc.inscricoes + Number(branch.total_inscritos_geral || 0),
    pago: acc.pago + Number(branch.valor_total_pago || 0),
    pendente: acc.pendente + Number(branch.valor_total_pendente || 0)
  }), { inscricoes: 0, pago: 0, pendente: 0 });

  // Transform data for popular modalities chart
  const modalitiesData = filteredData.flatMap(branch => 
    (branch.modalidades_populares || []).map(item => ({
      name: item.modalidade,
      count: item.total_inscritos
    }))
  )
  .slice(0, 6)
  .sort((a, b) => b.count - a.count); // Sort by count descending

  // Transform data for payment status chart
  const paymentStatusData = filteredData.flatMap(branch =>
    branch.inscritos_por_status_pagamento || []
  )
  .reduce((acc, curr) => {
    const existing = acc.find(item => item.status_pagamento === curr.status_pagamento);
    if (existing) {
      existing.quantidade += curr.quantidade;
    } else {
      acc.push({ ...curr });
    }
    return acc;
  }, [] as typeof filteredData[0]['inscritos_por_status_pagamento'])
  .sort((a, b) => b.quantidade - a.quantidade);

  // Transform data for categories chart
  const categoriesData = filteredData.flatMap(branch =>
    branch.atletas_por_categoria || []
  )
  .reduce((acc, curr) => {
    const existing = acc.find(item => item.categoria === curr.categoria);
    if (existing) {
      existing.quantidade += curr.quantidade;
    } else {
      acc.push({ ...curr });
    }
    return acc;
  }, [] as typeof filteredData[0]['atletas_por_categoria'])
  .sort((a, b) => b.quantidade - a.quantidade)
  .slice(0, 6);

  return (
    <div className="space-y-8">
      {/* Summary Cards Section */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Inscritos
                <InfoIcon tooltip="Número total de atletas inscritos no evento" />
              </CardTitle>
            </div>
            <Users className="h-4 w-4 text-olimpics-green-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.inscricoes.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Inscrições confirmadas e pendentes
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Pago
                <InfoIcon tooltip="Valor total confirmado em pagamentos" />
              </CardTitle>
            </div>
            <Coins className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatToCurrency(totals.pago)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Pagamentos já confirmados
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Pendente
                <InfoIcon tooltip="Valor total pendente de confirmação" />
              </CardTitle>
            </div>
            <Activity className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatToCurrency(totals.pendente)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Pagamentos aguardando confirmação
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Popular Modalities Chart */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Modalidades Mais Populares</CardTitle>
            <CardDescription>
              Top 6 modalidades com maior número de inscrições
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={CHART_CONFIG} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={modalitiesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Inscritos" fill={CHART_COLORS.blue}>
                    {modalitiesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS.blue} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Payment Status Chart */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Status de Pagamento</CardTitle>
            <CardDescription>
              Distribuição dos pagamentos por status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={CHART_CONFIG} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentStatusData}
                    dataKey="quantidade"
                    nameKey="status_pagamento"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => 
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                  >
                    {paymentStatusData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={PAYMENT_STATUS_COLORS[entry.status_pagamento as keyof typeof PAYMENT_STATUS_COLORS] || CHART_COLORS.blue} 
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                    content={<ChartLegendContent />}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Categories Chart */}
        <Card className="hover:shadow-lg transition-shadow col-span-2">
          <CardHeader>
            <CardTitle>Distribuição por Categoria</CardTitle>
            <CardDescription>
              Número de atletas inscritos por categoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={CHART_CONFIG} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoriesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis dataKey="categoria" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="quantidade" 
                    name="Atletas" 
                    fill={CHART_COLORS.purple}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
