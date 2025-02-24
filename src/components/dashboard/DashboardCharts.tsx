
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
import { ModalitiesTable } from "./ModalitiesTable";

interface DashboardChartsProps {
  data: BranchAnalytics[];
}

const COLORS = ['#009B40', '#EE7E01', '#4CAF50', '#2196F3', '#9C27B0', '#FF5722'];

export function DashboardCharts({ data }: DashboardChartsProps) {
  // Transform data for branch registrations and payments
  const branchData = data
    .filter(branch => branch.filial !== '_Nenhuma_') // Exclude placeholder branches
    .map(branch => ({
      name: branch.filial,
      total: branch.total_inscritos || 0,
      pago: branch.valor_total_pago || 0,
      pendente: branch.valor_total_pendente || 0
    }))
    .filter(branch => branch.total > 0) // Only show branches with registrations
    .sort((a, b) => b.total - a.total);

  // Transform data for payment status distribution
  const paymentStatusData = data.reduce((acc: { name: string; value: number }[], branch) => {
    const statusData = branch.inscritos_por_status_pagamento || [];
    statusData.forEach(({ status_pagamento, quantidade }) => {
      if (!status_pagamento || quantidade === 0) return;
      
      const existingStatus = acc.find(item => item.name === status_pagamento);
      if (existingStatus) {
        existingStatus.value += quantidade;
      } else {
        acc.push({ name: status_pagamento, value: quantidade });
      }
    });
    return acc;
  }, [])
  .filter(item => item.value > 0); // Remove zero-count statuses

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
    <div className="grid gap-4 md:grid-cols-2">
      {branchData.length > 0 && (
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
                <Tooltip />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  wrapperStyle={{ paddingTop: '20px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card className="col-span-2">
        <ModalitiesTable data={data} />
      </Card>
    </div>
  );
}
