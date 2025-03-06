
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  CartesianGrid 
} from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { EmptyChartMessage } from "./EmptyChartMessage";
import { CustomTooltip } from "./CustomTooltip";

interface PaymentStatusData {
  name: string;
  value: number;
  color: string;
}

interface PaymentStatusBarChartProps {
  data: PaymentStatusData[];
  chartConfig: any;
  title?: string;
  description?: string;
}

export function PaymentStatusBarChart({ 
  data, 
  chartConfig,
  title = "Status de Pagamento",
  description = "Distribuição dos pagamentos por status"
}: PaymentStatusBarChartProps) {
  // Convert pie data to horizontal bar chart data
  const barData = data.map(item => ({
    name: item.name,
    value: item.value,
    fill: item.color
  }));

  return (
    <Card className="hover:shadow-lg transition-shadow w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 90, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" label={{ value: 'Número de Inscrições', position: 'insideBottom', offset: -10 }} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tick={{ fontSize: 14 }}
                  width={80}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: 20 }} />
                {barData.map((entry, index) => (
                  <Bar 
                    key={`status-bar-${index}`}
                    dataKey="value" 
                    name={entry.name}
                    fill={entry.fill}
                    barSize={50}
                    radius={[0, 4, 4, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <EmptyChartMessage message="Sem dados de status de pagamento disponíveis" />
        )}
      </CardContent>
    </Card>
  );
}
