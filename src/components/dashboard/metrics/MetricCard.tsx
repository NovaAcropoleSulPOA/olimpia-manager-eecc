
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCardProps } from "./types";

export function MetricCard({ title, value, description, icon }: MetricCardProps) {
  return (
    <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-olimpics-text">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-olimpics-text">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
