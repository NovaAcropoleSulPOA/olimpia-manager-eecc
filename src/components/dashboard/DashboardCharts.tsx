import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BranchAnalytics } from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const COLORS = [
  "#009B40", // Primary green
  "#EE7E01", // Primary orange
  "#4CAF50", // Additional green
  "#F27C00", // Additional orange
  "#009C3F"  // Secondary green
];

interface DashboardChartsProps {
  data: BranchAnalytics[];
}

export function DashboardCharts({ data }: DashboardChartsProps) {
  // Transform data for athletes per branch chart
  const athletesData = data.map(branch => ({
    name: branch.filial,
    value: branch.total_inscritos || 0,
    totalPago: branch.valor_total_pago || 0,
    totalPendente: branch.valor_total_pendente || 0
  })).sort((a, b) => b.value - a.value);

  // Transform payment status data for pie chart
  const paymentStatusData = data.reduce((acc, branch) => {
    const statusData = branch.inscritos_por_status_pagamento || {};
    Object.entries(statusData).forEach(([status, count]) => {
      const existingStatus = acc.find(item => item.name === status);
      if (existingStatus) {
        existingStatus.value += count;
      } else {
        acc.push({ name: status, value: count });
      }
    });
    return acc;
  }, [] as { name: string; value: number }[]);

  console.log('Chart data:', {
    athletesData,
    paymentStatusData
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 shadow-lg rounded-lg border">
          <p className="font-bold text-olimpics-text">{label}</p>
          <p className="text-olimpics-green-primary">
            {`Total de Atletas: ${payload[0].value}`}
          </p>
          <p className="text-olimpics-orange-primary">
            {`Valor Pago: ${new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(payload[0].payload.totalPago)}`}
          </p>
          <p className="text-red-500">
            {`Valor Pendente: ${new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(payload[0].payload.totalPendente)}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-olimpics-text">Atletas por Filial</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={athletesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name"
                tick={{ fontSize: 12, fill: '#4b5563' }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12, fill: '#4b5563' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                fill="#009B40"
                name="Total de Atletas"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-olimpics-text">Status de Pagamentos</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={paymentStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
              >
                {paymentStatusData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`${value} atletas`, 'Total']}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  padding: '0.5rem'
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => <span className="text-olimpics-text">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}