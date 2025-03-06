

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
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
      <Card className="hover:shadow-lg transition-shadow col-span-2">
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
    <Card className="hover:shadow-lg transition-shadow col-span-2">
      <CardHeader>
        <CardTitle>Inscrições por Filial</CardTitle>
        <CardDescription>
          Top 10 filiais com maior número de inscrições por status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              barSize={20}
              barGap={5}
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
              <Bar 
                dataKey="confirmados" 
                name="Confirmados" 
                fill={chartColors.green} 
                stackId="stack"
              />
              <Bar 
                dataKey="pendentes" 
                name="Pendentes" 
                fill={chartColors.yellow} 
                stackId="stack"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
