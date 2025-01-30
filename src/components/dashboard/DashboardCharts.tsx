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
  Cell,
  ComposedChart,
  Line
} from "recharts";

interface DashboardChartsProps {
  data: BranchAnalytics[];
}

const COLORS = ['#009B40', '#EE7E01', '#4CAF50', '#2196F3', '#9C27B0', '#FF5722'];

export function DashboardCharts({ data }: DashboardChartsProps) {
  // Transform data for branch registrations and payments
  const branchData = data.map(branch => ({
    name: branch.filial,
    total: branch.total_inscritos || 0,
    pago: branch.valor_total_pago ? Number(branch.valor_total_pago) : 0,
    pendente: branch.valor_total_pendente ? Number(branch.valor_total_pendente) : 0
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

  // Transform data for modalities by category
  const modalitiesData = data.reduce((acc, branch) => {
    console.log("Processing branch modalidades_populares:", branch.modalidades_populares);
    
    if (!branch.modalidades_populares) return acc;

    Object.entries(branch.modalidades_populares as Record<string, {
      Masculino?: number;
      Feminino?: number;
      Misto?: number;
    }>).forEach(([modalidade, categorias]) => {
      const existingModalidade = acc.find(item => item.name === modalidade);
      if (existingModalidade) {
        existingModalidade.Masculino += categorias.Masculino || 0;
        existingModalidade.Feminino += categorias.Feminino || 0;
        existingModalidade.Misto += categorias.Misto || 0;
        existingModalidade.total = (
          (existingModalidade.Masculino || 0) + 
          (existingModalidade.Feminino || 0) + 
          (existingModalidade.Misto || 0)
        );
      } else {
        acc.push({
          name: modalidade,
          Masculino: categorias.Masculino || 0,
          Feminino: categorias.Feminino || 0,
          Misto: categorias.Misto || 0,
          total: (
            (categorias.Masculino || 0) + 
            (categorias.Feminino || 0) + 
            (categorias.Misto || 0)
          )
        });
      }
    });
    return acc;
  }, [] as any[])
  .sort((a, b) => b.total - a.total)
  .slice(0, 10);

  console.log("Processed modalities data:", modalitiesData);

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
      {branchData.length > 0 && (
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="text-olimpics-text">Inscrições por Filial</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={branchData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#4b5563' }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#4b5563' }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#4b5563' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  yAxisId="left"
                  dataKey="total" 
                  fill="#009B40"
                  name="Total de Atletas"
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
      )}

      {modalitiesData.length > 0 && (
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="text-olimpics-text">Top 10 Modalidades por Categoria</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modalitiesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="Masculino" fill="#2196F3" stackId="a" name="Masculino" />
                <Bar dataKey="Feminino" fill="#E91E63" stackId="a" name="Feminino" />
                <Bar dataKey="Misto" fill="#4CAF50" stackId="a" name="Misto" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {paymentStatusData.length > 0 && (
        <Card className="col-span-2 md:col-span-1">
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