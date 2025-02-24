
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BranchAnalytics } from "@/lib/api";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Line
} from "recharts";

interface BranchRegistrationsChartProps {
  data: BranchAnalytics[];
}

export function BranchRegistrationsChart({ data }: BranchRegistrationsChartProps) {
  const branchData = data
    .filter(branch => branch.filial !== '_Nenhuma_')
    .map(branch => {
      const pendingPayment = branch.inscritos_por_status_pagamento
        .find(status => status.status_pagamento === 'pendente')?.quantidade || 0;

      const averagePayment = branch.valor_total_pago / 
        (branch.total_inscritos_confirmados || 1);
      const estimatedPendingAmount = pendingPayment * averagePayment;

      return {
        name: branch.filial,
        total: branch.total_inscritos || 0,
        pago: branch.valor_total_pago || 0,
        pendente: estimatedPendingAmount
      };
    })
    .filter(branch => branch.total > 0)
    .sort((a, b) => b.total - a.total);

  if (branchData.length === 0) return null;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 shadow-lg rounded-lg border">
          <p className="font-bold text-olimpics-text">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              style={{ color: entry.color }}
              className="text-sm"
            >
              {`${entry.name === 'total' ? 'Total de Inscrições' : 
                 entry.name === 'pago' ? 'Valor Pago (R$)' : 
                 'Valor Pendente (R$)'}: ${
                 entry.name === 'total' ? entry.value :
                 new Intl.NumberFormat('pt-BR', {
                   style: 'currency',
                   currency: 'BRL'
                 }).format(entry.value)
              }`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="text-olimpics-text">Inscrições por Filial</CardTitle>
      </CardHeader>
      <CardContent className="h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart 
            data={branchData}
            margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="name"
              tick={{ fontSize: 12, fill: '#4b5563' }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={100}
              tickMargin={30}
            />
            <YAxis 
              yAxisId="left" 
              tick={{ fontSize: 12, fill: '#4b5563' }}
              tickFormatter={(value) => `${value}`}
              label={{ 
                value: 'Total de Inscrições',
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle' }
              }}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              tick={{ fontSize: 12, fill: '#4b5563' }}
              tickFormatter={(value) => `R$ ${value}`}
              label={{ 
                value: 'Valor (R$)',
                angle: 90,
                position: 'insideRight',
                style: { textAnchor: 'middle' }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top" 
              height={36}
              wrapperStyle={{ paddingBottom: '20px' }}
            />
            <Bar 
              yAxisId="left"
              dataKey="total" 
              fill="#009B40"
              name="Total de Inscrições"
              radius={[4, 4, 0, 0]}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="pago"
              stroke="#2196F3"
              name="Valor Pago (R$)"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="pendente"
              stroke="#FF5722"
              name="Valor Pendente (R$)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
