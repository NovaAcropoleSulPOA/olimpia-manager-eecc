
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend } from "@/components/ui/chart";
import { EmptyChartMessage } from "./EmptyChartMessage";
import { ChartConfig } from "@/components/ui/chart/types";

interface PaymentStatusData {
  name: string;
  value: number;
  color: string;
}

interface PaymentStatusPieChartProps {
  data: PaymentStatusData[];
  chartConfig: ChartConfig;
  title?: string;
  description?: string;
}

export function PaymentStatusPieChart({ 
  data, 
  chartConfig,
  title = "Status de Pagamento",
  description = "Distribuição dos pagamentos por status"
}: PaymentStatusPieChartProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => 
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                    />
                  ))}
                </Pie>
                <ChartTooltip>
                  <ChartTooltipContent />
                </ChartTooltip>
                <ChartLegend />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <EmptyChartMessage message="Sem dados de status de pagamento disponíveis" />
        )}
      </CardContent>
    </Card>
  );
}
