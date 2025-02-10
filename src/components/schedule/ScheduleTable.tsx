
import React from 'react';
import { format } from "date-fns";
import { Clock } from "lucide-react";
import { ActivityCard } from './ActivityCard';

interface ScheduleActivity {
  id: number;
  atividade: string;
  local: string;
  modalidade_nome: string;
  global: boolean;
  horario_inicio: string;
  horario_fim: string;
  dia: string;
}

interface GroupedActivities {
  [key: string]: {
    [key: string]: ScheduleActivity[];
  };
}

interface ScheduleTableProps {
  groupedActivities: GroupedActivities;
  dates: string[];
  timeSlots: string[];
}

export function ScheduleTable({ groupedActivities, dates, timeSlots }: ScheduleTableProps) {
  console.log('ScheduleTable render:', { groupedActivities, dates, timeSlots });
  
  if (dates.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        Nenhuma atividade encontrada no cronograma.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border-b p-4 text-left font-semibold text-olimpics-green-primary">
              Horário
            </th>
            {dates.map(date => (
              <th key={date} className="border-b p-4 text-left font-semibold text-olimpics-green-primary">
                {format(new Date(date), "dd/MM/yyyy")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map(timeSlot => {
            const [start, end] = timeSlot.split('-');
            return (
              <tr key={timeSlot} className="border-b last:border-b-0">
                <td className="p-4 align-top">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Clock className="h-4 w-4 shrink-0" />
                    <span className="whitespace-nowrap">
                      {start.slice(0, 5)} - {end.slice(0, 5)}
                    </span>
                  </div>
                </td>
                {dates.map(date => (
                  <td key={`${date}-${timeSlot}`} className="p-4 align-top">
                    <div className="space-y-2">
                      {groupedActivities[date]?.[timeSlot]?.map((activity, index) => (
                        <ActivityCard 
                          key={`${activity.id}-${index}`}
                          activity={activity}
                        />
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
