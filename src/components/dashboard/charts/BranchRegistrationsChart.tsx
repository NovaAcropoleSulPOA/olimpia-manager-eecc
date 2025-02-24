
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
  Line
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
          <ComposedChart 
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
                value: 'Valor Pago (R$)',
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
              dataKey="totalGeral" 
              fill="#009B40"
              name="Total de Inscritos"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              yAxisId="left"
              dataKey="totalModalidades" 
              fill="#2196F3"
              name="Total de Inscrições em Modalidades"
              radius={[4, 4, 0, 0]}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="pago"
              stroke="#FF5722"
              name="Valor Pago (R$)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
