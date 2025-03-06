
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  BarChart, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Bar, 
  ResponsiveContainer, 
  Legend, 
  CartesianGrid 
} from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { EmptyChartMessage } from "./EmptyChartMessage";
import { CustomTooltip } from "./CustomTooltip";

interface ModalitiesChartProps {
  data: any[];
  chartColors: Record<string, string>;
  chartConfig: any;
}

// Custom colors for branches
const BRANCH_COLORS = [
  "#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe", 
  "#00C49F", "#FFBB28", "#FF8042", "#a4de6c", "#d0ed57",
  "#e85de2", "#6d58f5", "#fa7f72", "#36a2eb", "#4bc0c0"
];

export function ModalitiesChart({ data, chartColors, chartConfig }: ModalitiesChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="hover:shadow-lg transition-shadow w-full">
        <CardHeader>
          <CardTitle>Modalidades Mais Populares</CardTitle>
          <CardDescription>
            Modalidades com maior número de inscrições por filial
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyChartMessage message="Sem dados de modalidades disponíveis" />
        </CardContent>
      </Card>
    );
  }

  // Get all unique branch names from the data
  const branchNames = new Set<string>();
  
  data.forEach(item => {
    Object.keys(item).forEach(key => {
      if (key !== 'name' && key !== 'total') {
        branchNames.add(key);
      }
    });
  });

  // Sort branch names alphabetically
  const sortedBranchNames = Array.from(branchNames).sort();

  return (
    <Card className="hover:shadow-lg transition-shadow w-full">
      <CardHeader>
        <CardTitle>Modalidades Mais Populares</CardTitle>
        <CardDescription>
          Modalidades com maior número de inscrições por filial
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[550px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data} 
              margin={{ top: 20, right: 30, left: 30, bottom: 100 }}
              barCategoryGap={15}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={100} 
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
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
                wrapperStyle={{ 
                  paddingBottom: 20,
                  fontSize: '12px',
                  overflowX: 'auto',
                  width: '100%'
                }}
                layout="horizontal"
              />
              
              {sortedBranchNames.map((branchName, index) => (
                <Bar 
                  key={branchName}
                  dataKey={branchName} 
                  name={branchName} 
                  stackId="a"
                  fill={BRANCH_COLORS[index % BRANCH_COLORS.length]} 
                  radius={[index === 0 ? 4 : 0, index === sortedBranchNames.length - 1 ? 4 : 0, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
