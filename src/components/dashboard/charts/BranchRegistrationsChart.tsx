
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart
} from "recharts";
import { CustomTooltip } from "./CustomTooltip";
import { ChartBranchData } from "./types";

interface BranchRegistrationsChartProps {
  data: ChartBranchData[];
}

export function BranchRegistrationsChart({ data }: BranchRegistrationsChartProps) {
  if (data.length === 0) return null;

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="text-olimpics-text">Inscrições por Filial</CardTitle>
      </CardHeader>
      <CardContent className="h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data}
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
              tick={{ fontSize: 12, fill: '#4b5563' }}
              tickFormatter={(value) => `${value}`}
              label={{ 
                value: 'Número de Inscrições',
                angle: -90,
                position: 'insideLeft',
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
              dataKey="totalGeral" 
              fill="#009B40"
              name="Total de Inscritos"
              radius={[4, 4, 0, 0]}
              stackId="status"
            />
            <Bar 
              dataKey="confirmados" 
              fill="#4CAF50"
              name="Confirmados"
              radius={[4, 4, 0, 0]}
              stackId="breakdown"
            />
            <Bar 
              dataKey="pendentes" 
              fill="#FFC107"
              name="Pendentes"
              radius={[4, 4, 0, 0]}
              stackId="breakdown"
            />
            <Bar 
              dataKey="cancelados" 
              fill="#F44336"
              name="Cancelados"
              radius={[4, 4, 0, 0]}
              stackId="breakdown"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
