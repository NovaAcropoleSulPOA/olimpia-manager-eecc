
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ActivityCardProps {
  activity: {
    id: number;
    atividade: string;
    local: string;
    modalidade_nome: string;
    is_registered: boolean;
    global: boolean;
    registration_status: string;
    modalidade_id: number | null;
  };
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const getActivityStyle = (activity: ActivityCardProps['activity']) => {
    if (activity.is_registered) {
      const statusStyles = {
        'confirmado': 'border-green-600 bg-green-50',
        'pendente': 'border-yellow-400 bg-yellow-50',
        'rejeitado': 'border-red-400 bg-red-50',
        'cancelado': 'border-gray-400 bg-gray-50'
      };
      return statusStyles[activity.registration_status as keyof typeof statusStyles] || 'border-olimpics-green-primary bg-olimpics-green-primary/10';
    }
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
                variant={activity.is_registered ? "default" : "secondary"}
                className={cn(
                  activity.is_registered && 
                  activity.registration_status === 'confirmado' && 
                  "bg-green-600"
                )}
              >
                {modalidade}
              </Badge>
            ))}
          </div>
        )}
        {activity.is_registered && (
          <Badge 
            variant="outline" 
            className={cn(
              "mt-2",
              activity.registration_status === 'confirmado' && "border-green-600 text-green-600",
              activity.registration_status === 'pendente' && "border-yellow-400 text-yellow-600",
              activity.registration_status === 'rejeitado' && "border-red-400 text-red-600",
              activity.registration_status === 'cancelado' && "border-gray-400 text-gray-600"
            )}
          >
            {activity.registration_status}
          </Badge>
        )}
      </div>
    </div>
  );
}
