
import { TooltipProps } from 'recharts';

export function CustomTooltip({ active, payload, label }: TooltipProps<any, any>) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 shadow-lg rounded-lg border">
        <p className="font-bold text-olimpics-text">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p
            key={index}
            style={{ color: entry.color }}
            className="text-sm"
          >
            {`${entry.name === 'totalGeral' ? 'Total de Inscritos' :
               entry.name === 'totalModalidades' ? 'Total de Inscrições em Modalidades' :
               'Valor Pago (R$)'}: ${
               entry.name === 'pago'
                 ? new Intl.NumberFormat('pt-BR', {
                     style: 'currency',
                     currency: 'BRL'
                   }).format(entry.value)
                 : entry.value
            }`}
          </p>
        ))}
      </div>
    );
  }
  return null;
}
