
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
    // Use the most severe status for the card background
    const hasGlobal = activities.some(act => act.global);
    if (hasGlobal) {
      return 'border-yellow-400 bg-yellow-50';
    }
    
    const statuses = activities.map(act => act.modalidade_status?.toLowerCase());
    if (statuses.includes('cancelado')) {
      return 'border-red-400 bg-red-50';
    }
    if (statuses.includes('pendente')) {
      return 'border-yellow-400 bg-yellow-50';
    }
    if (statuses.includes('confirmado')) {
      return 'border-green-600 bg-green-50';
    }
    return 'border-gray-200 bg-white';
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
        <h4 className="font-medium text-olimpics-green-primary">{category}</h4>
        <div className="text-sm text-gray-600">
          <span>{location}</span>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {activities.map((activity) => (
            <Badge 
              key={`${activity.cronograma_atividade_id}-${activity.atividade}`}
              variant="secondary"
              className={cn(
                getStatusColor(activity.modalidade_status || ''),
                'whitespace-nowrap'
              )}
            >
              {activity.atividade}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
