
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts";
import { PaymentStatusData } from "./types";

interface PaymentStatusChartProps {
  data: PaymentStatusData[];
}

const COLORS = ['#009B40', '#EE7E01', '#4CAF50', '#2196F3', '#9C27B0', '#FF5722'];

export function PaymentStatusChart({ data }: PaymentStatusChartProps) {
  if (data.length === 0) return null;

  return (
    <Card className="col-span-2 md:col-span-1">
      <CardHeader>
        <CardTitle className="text-olimpics-text">Status de Pagamento</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              wrapperStyle={{ paddingTop: '20px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
