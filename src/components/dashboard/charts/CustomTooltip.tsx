
import { TooltipProps } from 'recharts';

export function CustomTooltip({ active, payload, label }: TooltipProps<any, any>) {
  if (active && payload && payload.length) {
    // Filter out entries with zero value
    const nonZeroPayload = payload.filter((entry: any) => 
      entry.value !== 0 && entry.value !== undefined
    );

    if (nonZeroPayload.length === 0) return null;

    return (
      <div className="bg-white p-4 shadow-lg rounded-lg border">
        <p className="font-bold text-olimpics-text mb-2">{label}</p>
        {nonZeroPayload.map((entry: any, index: number) => (
          <p
            key={index}
            style={{ color: entry.color }}
            className="text-sm"
          >
            {`${entry.name}: ${typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
}
