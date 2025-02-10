
import React from 'react';
import { format } from "date-fns";
import { Clock } from "lucide-react";
import { ActivityCard } from './ActivityCard';
import { ScheduleActivity } from '../AthleteSchedule';

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
  if (dates.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
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
                      {groupedActivities[date]?.[timeSlot]?.map((activity) => (
                        <ActivityCard 
                          key={activity.id}
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
