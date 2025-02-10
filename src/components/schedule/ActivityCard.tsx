
import React from 'react';
import { Badge } from "@/components/ui/badge";

interface ActivityCardProps {
  activity: {
    id: number;
    atividade: string;
    local: string;
    modalidade_nome: string;
    global: boolean;
  };
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const getActivityStyle = (activity: ActivityCardProps['activity']) => {
    if (activity.global) {
      return 'border-yellow-400 bg-yellow-50';
    }
    return 'border-gray-200 bg-white';
  };

  // Split modalidades string into array and clean up empty entries
  const modalidades = activity.modalidade_nome
    ? activity.modalidade_nome.split(',').map(m => m.trim()).filter(Boolean)
    : [];

  return (
    <div
      className={`p-3 rounded-lg border ${getActivityStyle(activity)}`}
    >
      <div className="space-y-2">
        <h4 className="font-medium">{activity.atividade}</h4>
        <div className="text-sm text-gray-600">
          <span>{activity.local}</span>
        </div>
        {modalidades.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {modalidades.map((modalidade, idx) => (
              <Badge 
                key={idx}
                variant="secondary"
                className="text-xs py-0.5"
              >
                {modalidade}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
