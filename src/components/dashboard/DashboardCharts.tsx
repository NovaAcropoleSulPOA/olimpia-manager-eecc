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
  Legend
} from "recharts";

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

  // Transform data for top 10 modalities by category
  const modalitiesData = Object.entries(
    data.reduce((acc, branch) => {
      const modalidades = branch.modalidades_populares || {};
      Object.entries(modalidades).forEach(([modalidade, categorias]) => {
        if (!acc[modalidade]) {
          acc[modalidade] = {
            name: modalidade,
            masculino: 0,
            feminino: 0,
            misto: 0,
            total: 0
          };
        }
        if (categorias) {
          acc[modalidade].masculino += categorias.Masculino || 0;
          acc[modalidade].feminino += categorias.Feminino || 0;
          acc[modalidade].misto += categorias.Misto || 0;
          acc[modalidade].total = 
            acc[modalidade].masculino + 
            acc[modalidade].feminino + 
            acc[modalidade].misto;
        }
      });
      return acc;
    }, {} as Record<string, any>)
  )
    .map(([_, value]) => value)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  console.log('Chart data:', {
    athletesData,
    modalitiesData
  });

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
          <p className="text-sm text-olimpics-text mt-2">
            {`Total: ${payload.reduce((sum: number, entry: any) => sum + entry.value, 0)}`}
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
          <CardTitle className="text-olimpics-text">Top 10 Modalidades por Categoria</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={modalitiesData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
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
              <Legend />
              <Bar
                dataKey="masculino"
                stackId="a"
                fill="#009B40"
                name="Masculino"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="feminino"
                stackId="a"
                fill="#EE7E01"
                name="Feminino"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="misto"
                stackId="a"
                fill="#4CAF50"
                name="Misto"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}