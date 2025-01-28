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

const COLORS = ["#009B40", "#EE7E01", "#4CAF50", "#2196F3", "#9C27B0"];

interface DashboardChartsProps {
  data: BranchAnalytics[];
}

export function DashboardCharts({ data }: DashboardChartsProps) {
  // Transform data for revenue chart
  const revenueData = data.map(branch => ({
    name: branch.filial,
    value: branch.valor_total_arrecadado
  }));

  // Transform and aggregate modalities data
  const modalitiesData = data.reduce((acc, branch) => {
    Object.entries(branch.modalidades_populares || {}).forEach(([modalidade, count]) => {
      const existing = acc.find(item => item.name === modalidade);
      if (existing) {
        existing.value += count;
      } else {
        acc.push({ name: modalidade, value: count });
      }
    });
    return acc;
  }, [] as { name: string; value: number }[])
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Receita por Filial</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis
                tickFormatter={(value) =>
                  new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    notation: 'compact'
                  }).format(value)
                }
              />
              <Tooltip
                formatter={(value: number) =>
                  new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(value)
                }
              />
              <Bar dataKey="value" fill="#009B40" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Top 5 Modalidades</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={modalitiesData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
              >
                {modalitiesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}