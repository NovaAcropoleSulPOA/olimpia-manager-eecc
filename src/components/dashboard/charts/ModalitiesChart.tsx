
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, XAxis, YAxis, Tooltip, Bar, ResponsiveContainer, Cell } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { EmptyChartMessage } from "./EmptyChartMessage";
import { CustomTooltip } from "./CustomTooltip";

interface ModalityData {
  name: string;
  count: number;
}

interface ModalitiesChartProps {
  data: ModalityData[];
  chartColors: Record<string, string>;
  chartConfig: any;
}

export function ModalitiesChart({ data, chartColors, chartConfig }: ModalitiesChartProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>Modalidades Mais Populares</CardTitle>
        <CardDescription>
          Top 6 modalidades com maior número de inscrições
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Inscritos" fill={chartColors.blue}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors.blue} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <EmptyChartMessage message="Sem dados de modalidades disponíveis" />
        )}
      </CardContent>
    </Card>
  );
}
