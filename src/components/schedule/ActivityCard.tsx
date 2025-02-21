
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ActivityCardProps {
  category: string;
  activities: Array<{
    id: number;
    cronograma_atividade_id: number;
    atividade: string;
    local: string;
    modalidade_nome: string | null;
    modalidade_status: string | null;
    global: boolean;
  }>;
}

export function ActivityCard({ category, activities }: ActivityCardProps) {
  const getActivityStyle = (activities: ActivityCardProps['activities']) => {
    const isGlobal = activities.some(act => act.global);
    if (isGlobal) {
      return 'border-yellow-400 bg-yellow-50';
    }
    
    const statuses = activities.map(act => act.modalidade_status?.toLowerCase());
    
    // If at least one modality is confirmed, show green border
    if (statuses.includes('confirmado')) {
      return 'border-green-600 bg-green-50';
    }
    
    // If ALL modalities are canceled, show red border
    if (statuses.length > 0 && statuses.every(status => status === 'cancelado')) {
      return 'border-red-400 bg-red-50';
    }
    
    // Default style for other cases (pending or mixed statuses)
    return 'border-gray-200 bg-white';
  };

  const getStatusColor = (status: string | null, isGlobal: boolean) => {
    if (isGlobal) return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80';
    if (!status) return 'bg-gray-100 text-gray-800 hover:bg-gray-100/80';
    
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

  // Get unique location from activities
  const location = activities[0]?.local || '';

  return (
    <div
      className={cn(
        'p-3 rounded-lg border',
        getActivityStyle(activities)
      )}
    >
      <div className="space-y-2">
        <h4 className="font-medium text-olimpics-green-primary">{activities[0].atividade}</h4>
        <div className="pl-2 space-y-3">
          <div className="text-sm text-gray-600">
            <span>{location}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {activities.map((activity) => {
              const displayName = activity.modalidade_nome || activity.atividade;
              return (
                <Badge 
                  key={`${activity.cronograma_atividade_id}-${activity.modalidade_nome}`}
                  variant="secondary"
                  className={cn(
                    getStatusColor(activity.modalidade_status, activity.global),
                    'whitespace-nowrap'
                  )}
                >
                  {displayName}
                  {activity.global && ' (Todos)'}
                </Badge>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
