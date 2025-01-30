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
  console.log('Raw data received in DashboardCharts:', data);

  // Transform data for athletes per branch chart
  const athletesData = data.map(branch => {
    console.log(`Processing branch ${branch.filial}:`, branch);
    return {
      name: branch.filial,
      value: parseInt(branch.total_inscritos.toString()) || 0
    };
  });

  console.log('Transformed athletes data:', athletesData);

  // Transform and aggregate modalities data
  const modalitiesMap = new Map<string, number>();
  
  data.forEach(branch => {
    if (Array.isArray(branch.modalidades_populares)) {
      branch.modalidades_populares.forEach(modalidade => {
        const currentCount = modalitiesMap.get(modalidade.modalidade) || 0;
        modalitiesMap.set(
          modalidade.modalidade, 
          currentCount + (parseInt(modalidade.total_inscritos.toString()) || 0)
        );
      });
    } else {
      console.warn('modalidades_populares is not an array:', branch.modalidades_populares);
    }
  });

  const modalitiesData = Array.from(modalitiesMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  console.log('Transformed modalities data:', modalitiesData);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Atletas por Filial</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={athletesData}>
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
              <Tooltip 
                formatter={(value: number) => [value.toLocaleString(), 'Atletas']}
              />
              <Bar 
                dataKey="value" 
                fill="#009B40"
                name="Total de Atletas"
              />
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
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [value.toLocaleString(), 'Atletas']}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}