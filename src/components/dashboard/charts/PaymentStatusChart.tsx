
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BranchAnalytics } from "@/lib/api";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

interface PaymentStatusChartProps {
  data: BranchAnalytics[];
}

const COLORS = ['#009B40', '#EE7E01', '#4CAF50', '#2196F3', '#9C27B0', '#FF5722'];

export function PaymentStatusChart({ data }: PaymentStatusChartProps) {
  const paymentStatusData = data.reduce((acc: { name: string; value: number }[], branch) => {
    const statusData = branch.inscritos_por_status_pagamento || [];
    statusData.forEach(({ status_pagamento, quantidade }) => {
      if (!status_pagamento || quantidade === 0) return;
      
      const existingStatus = acc.find(item => item.name === status_pagamento);
      if (existingStatus) {
        existingStatus.value += quantidade;
      } else {
        acc.push({ name: status_pagamento, value: quantidade });
      }
    });
    return acc;
  }, [])
  .filter(item => item.value > 0);

  if (paymentStatusData.length === 0) return null;

  return (
    <Card className="col-span-2 md:col-span-1">
      <CardHeader>
        <CardTitle className="text-olimpics-text">Status de Pagamento</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={paymentStatusData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {paymentStatusData.map((entry, index) => (
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
