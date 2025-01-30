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
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";

interface DashboardChartsProps {
  data: BranchAnalytics[];
}

const COLORS = ['#009B40', '#EE7E01', '#4CAF50', '#2196F3', '#9C27B0', '#FF5722'];

export function DashboardCharts({ data }: DashboardChartsProps) {
  // Transform data for athletes per branch
  const athletesData = data.map(branch => ({
    name: branch.filial,
    total: branch.total_inscritos || 0,
    pagos: branch.valor_total_pago ? Number(branch.valor_total_pago) : 0,
    pendentes: branch.valor_total_pendente ? Number(branch.valor_total_pendente) : 0
  })).sort((a, b) => b.total - a.total);

  // Transform data for payment status distribution
  const paymentStatusData = data.reduce((acc, branch) => {
    const statusData = branch.inscritos_por_status_pagamento as Record<string, number> || {};
    Object.entries(statusData).forEach(([status, count]) => {
      if (status && count > 0) {
        const existingStatus = acc.find(item => item.name === status);
        if (existingStatus) {
          existingStatus.value += count;
        } else {
          acc.push({ name: status, value: count });
        }
      }
    });
    return acc;
  }, [] as { name: string; value: number }[]);

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
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {athletesData.some(item => item.total > 0) && (
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
                  dataKey="total" 
                  fill="#009B40"
                  name="Total de Atletas"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {paymentStatusData.length > 0 && (
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-olimpics-text">Status de Pagamento</CardTitle>
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
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}