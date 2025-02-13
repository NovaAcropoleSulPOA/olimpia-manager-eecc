
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ActivityCardProps {
  activity: {
    id: number;
    cronograma_atividade_id: number;
    atividade: string;
    local: string;
    modalidade_nome: string | null;
    modalidade_status: string | null;
    global: boolean;
  };
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const getActivityStyle = (activity: ActivityCardProps['activity']) => {
    if (activity.global) {
      return 'border-yellow-400 bg-yellow-50';
    }
    
    if (!activity.modalidade_status || !activity.modalidade_nome) {
      return 'border-gray-200 bg-white';
    }

    switch (activity.modalidade_status.toLowerCase()) {
      case 'confirmado':
        return 'border-green-600 bg-green-50';
      case 'pendente':
        return 'border-yellow-400 bg-yellow-50';
      case 'cancelado':
        return 'border-red-400 bg-red-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmado':
        return 'bg-green-100 text-green-800 hover:bg-green-100/80';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80';
      case 'cancelado':
        return 'bg-red-100 text-red-800 hover:bg-red-100/80';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100/80';
    }
  };

  // Extract category from modalidade_nome if it exists
  const category = activity.modalidade_nome?.split(' - ')[0] || null;
  const modalityName = activity.modalidade_nome?.split(' - ')[1] || activity.modalidade_nome;

  return (
    <div
      className={cn(
        'p-3 rounded-lg border',
        getActivityStyle(activity)
      )}
    >
      <div className="space-y-2">
        {category && (
          <h4 className="font-medium text-olimpics-green-primary">{category}</h4>
        )}
        <div className="pl-2">
          <p className="text-sm font-medium">{activity.atividade}</p>
          <div className="text-sm text-gray-600">
            <span>{activity.local}</span>
          </div>
          {modalityName && activity.modalidade_status && (
            <div className="flex flex-wrap gap-1 mt-2">
              <Badge 
                variant="secondary"
                className={cn(getStatusColor(activity.modalidade_status))}
              >
                {modalityName}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
