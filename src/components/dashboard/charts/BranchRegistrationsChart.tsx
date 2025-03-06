
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
  Line
} from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { EmptyChartMessage } from "./EmptyChartMessage";
import { CustomTooltip } from "./CustomTooltip";

interface BranchRegistrationData {
  filial_nome: string;
  status_pagamento: string;
  quantidade: number;
}

interface TransformedBranchData {
  name: string;
  confirmados: number;
  pendentes: number;
  total: number;
}

interface BranchRegistrationsChartProps {
  data: BranchRegistrationData[];
  chartColors: Record<string, string>;
  chartConfig: any;
}

export function BranchRegistrationsChart({ data, chartColors, chartConfig }: BranchRegistrationsChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="hover:shadow-lg transition-shadow col-span-full">
        <CardHeader>
          <CardTitle>Inscrições por Filial</CardTitle>
          <CardDescription>
            Distribuição de inscrições por filial e status de pagamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyChartMessage message="Sem dados de inscrições por filial disponíveis" />
        </CardContent>
      </Card>
    );
  }

  // Transform the data to group by filial_nome and separate status
  const branchMap = new Map<string, TransformedBranchData>();
  
  data.forEach(item => {
    if (!item.filial_nome) return;
    
    if (!branchMap.has(item.filial_nome)) {
      branchMap.set(item.filial_nome, {
        name: item.filial_nome,
        confirmados: 0,
        pendentes: 0,
        total: 0
      });
    }
    
    const branch = branchMap.get(item.filial_nome)!;
    const quantity = Number(item.quantidade) || 0;
    
    if (item.status_pagamento === 'confirmado') {
      branch.confirmados += quantity;
    } else if (item.status_pagamento === 'pendente') {
      branch.pendentes += quantity;
    }
    
    branch.total += quantity;
  });
  
  const chartData = Array.from(branchMap.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 10); // Limit to top 10 branches for readability

  return (
    <Card className="hover:shadow-lg transition-shadow col-span-full">
      <CardHeader>
        <CardTitle>Inscrições por Filial</CardTitle>
        <CardDescription>
          Top 10 filiais com maior número de inscrições por status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={80}
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* Total bar showing combined value */}
              <Bar 
                dataKey="total" 
                name="Total" 
                fill={chartColors.blue} 
                barSize={40}
                radius={[4, 4, 0, 0]}
              />
              
              {/* Lines for detailed breakdown */}
              <Line 
                type="monotone" 
                dataKey="confirmados" 
                name="Confirmados" 
                stroke={chartColors.green} 
                strokeWidth={2} 
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="pendentes" 
                name="Pendentes" 
                stroke={chartColors.yellow} 
                strokeWidth={2} 
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                strokeDasharray="5 5"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
