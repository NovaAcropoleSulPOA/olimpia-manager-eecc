
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ActivityCardProps {
  activity: {
    id: number;
    atividade: string;
    local: string;
    modalidade_nome: string | null;
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

  return (
    <div
      className={cn(
        'p-3 rounded-lg border',
        getActivityStyle(activity)
      )}
    >
      <div className="space-y-2">
        <h4 className="font-medium">{activity.atividade}</h4>
        <div className="text-sm text-gray-600">
          <span>{activity.local}</span>
        </div>
        {activity.modalidade_nome && (
          <div className="flex flex-wrap gap-1 mt-2">
            {activity.modalidade_nome.split(', ').map((modalidade, idx) => (
              <Badge 
                key={idx}
                variant="secondary"
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
