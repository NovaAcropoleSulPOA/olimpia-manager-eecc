
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
  "#00C49F", "#FFBB28", "#FF8042", "#a4de6c", "#d0ed57"
];

export function ModalitiesChart({ data, chartColors, chartConfig }: ModalitiesChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle>Modalidades Mais Populares</CardTitle>
          <CardDescription>
            Top 6 modalidades com maior número de inscrições por filial
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
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>Modalidades Mais Populares</CardTitle>
        <CardDescription>
          Top 6 modalidades com maior número de inscrições por filial
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data} 
              margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
              barCategoryGap={10}
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
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ bottom: -10 }} />
              
              {sortedBranchNames.map((branchName, index) => (
                <Bar 
                  key={branchName}
                  dataKey={branchName} 
                  name={branchName} 
                  stackId="a"
                  fill={BRANCH_COLORS[index % BRANCH_COLORS.length]} 
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
