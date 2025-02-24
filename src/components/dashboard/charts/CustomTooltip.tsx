
import { TooltipProps } from 'recharts';
import { TooltipData } from './types';

export function CustomTooltip({ active, payload, label }: TooltipProps<any, any>) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 shadow-lg rounded-lg border">
        <p className="font-bold text-olimpics-text mb-2">{label}</p>
        {payload.map((entry: any, index: number) => {
          // Skip entries with value 0
          if (entry.value === 0) return null;

          const label = {
            totalGeral: 'Total de Inscritos',
            totalModalidades: 'Total de Inscrições em Modalidades',
            confirmados: 'Inscrições Confirmadas',
            pendentes: 'Inscrições Pendentes',
            cancelados: 'Inscrições Canceladas'
          }[entry.dataKey] || entry.name;

          return (
            <p
              key={index}
              style={{ color: entry.color }}
              className="text-sm"
            >
              {`${label}: ${entry.value}`}
            </p>
          );
        })}
      </div>
    );
  }
  return null;
}
