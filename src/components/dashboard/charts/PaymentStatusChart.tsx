
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

const STATUS_LABELS = {
  'confirmado': 'Confirmado',
  'pendente': 'Pendente',
  'cancelado': 'Cancelado'
};

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
              label={({ name, percent }) => 
                `${STATUS_LABELS[name as keyof typeof STATUS_LABELS] || name} (${(percent * 100).toFixed(0)}%)`
              }
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value: string) => STATUS_LABELS[value as keyof typeof STATUS_LABELS] || value}
              wrapperStyle={{ paddingTop: '20px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
