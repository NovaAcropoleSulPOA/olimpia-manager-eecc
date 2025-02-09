
import React from 'react';

export function ScheduleLegend() {
  return (
    <div className="space-y-2 border rounded-lg p-3 bg-white shadow-sm">
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-olimpics-green-primary/30 border border-olimpics-green-primary" />
        <span className="text-sm">Atividades Inscritas</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-yellow-50 border border-yellow-400" />
        <span className="text-sm">Atividades Gerais</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-white border border-gray-200" />
        <span className="text-sm">Outras Atividades</span>
      </div>
    </div>
  );
}
