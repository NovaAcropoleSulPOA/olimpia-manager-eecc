
interface EmptyChartMessageProps {
  message?: string;
}

export function EmptyChartMessage({ message = "Não há dados disponíveis" }: EmptyChartMessageProps) {
  return (
    <div className="flex items-center justify-center h-[300px]">
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}
