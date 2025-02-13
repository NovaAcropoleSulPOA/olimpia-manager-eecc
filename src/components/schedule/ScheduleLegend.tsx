
import React from 'react';
import { Circle } from 'lucide-react';

export function ScheduleLegend() {
  return (
    <div className="space-y-2 border rounded-lg p-3 bg-white shadow-sm">
      <div className="flex items-center gap-2">
        <Circle className="h-3 w-3 text-green-600 fill-green-50" />
        <span className="text-sm">Inscrição Confirmada</span>
      </div>
      <div className="flex items-center gap-2">
        <Circle className="h-3 w-3 text-yellow-400 fill-yellow-50" />
        <span className="text-sm">Inscrição Pendente</span>
      </div>
      <div className="flex items-center gap-2">
        <Circle className="h-3 w-3 text-red-400 fill-red-50" />
        <span className="text-sm">Inscrição Cancelada</span>
      </div>
      <div className="flex items-center gap-2">
        <Circle className="h-3 w-3 text-yellow-400 fill-yellow-50" />
        <span className="text-sm">Atividades Gerais</span>
      </div>
      <div className="flex items-center gap-2">
        <Circle className="h-3 w-3 text-gray-200 fill-white" />
        <span className="text-sm">Outras Atividades</span>
      </div>
    </div>
  );
}
