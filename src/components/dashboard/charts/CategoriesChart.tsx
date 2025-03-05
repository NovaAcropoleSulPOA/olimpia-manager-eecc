
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { EmptyChartMessage } from "./EmptyChartMessage";
import { CustomTooltip } from "./CustomTooltip";

interface CategoryData {
  categoria: string;
  quantidade: number;
}

interface CategoriesChartProps {
  data: CategoryData[];
  chartColors: Record<string, string>;
  chartConfig: any;
}

export function CategoriesChart({ data, chartColors, chartConfig }: CategoriesChartProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow col-span-2">
      <CardHeader>
        <CardTitle>Distribuição por Categoria</CardTitle>
        <CardDescription>
          Número de atletas inscritos por categoria
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="categoria" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="quantidade" 
                  name="Atletas" 
                  fill={chartColors.purple}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <EmptyChartMessage message="Sem dados de categorias disponíveis" />
        )}
      </CardContent>
    </Card>
  );
}
