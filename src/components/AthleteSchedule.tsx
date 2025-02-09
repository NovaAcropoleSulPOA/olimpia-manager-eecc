
import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ChevronDown, Clock } from "lucide-react";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface ScheduleActivity {
  id: number;
  atividade: string;
  horario_inicio: string;
  horario_fim: string;
  dia: string;
  local: string;
  is_registered: boolean;
  global: boolean;
}

interface GroupedActivities {
  [key: string]: {
    [key: string]: ScheduleActivity[];
  };
}

export default function AthleteSchedule() {
  const [isOpen, setIsOpen] = React.useState(true);

  const { data: activities, isLoading } = useQuery({
    queryKey: ['schedule-activities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vw_cronograma_atividades_usuario')
        .select('*')
        .order('dia')
        .order('horario_inicio');

      if (error) {
        console.error('Error fetching schedule:', error);
        throw error;
      }

      return data as ScheduleActivity[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-olimpics-green-primary" />
      </div>
    );
  }

  // Group activities by date and time
  const groupedActivities = activities?.reduce((groups, activity) => {
    const date = activity.dia;
    const time = `${activity.horario_inicio}-${activity.horario_fim}`;
    
    if (!groups[date]) {
      groups[date] = {};
    }
    
    if (!groups[date][time]) {
      groups[date][time] = [];
    }
    
    groups[date][time].push(activity);
    return groups;
  }, {} as GroupedActivities) || {};

  // Get unique dates for column headers
  const dates = Object.keys(groupedActivities).sort();

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-olimpics-green-primary flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Cronograma de Atividades
          </CardTitle>
          <CollapsibleTrigger>
            <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="grid grid-cols-[auto_repeat(auto-fill,minmax(250px,1fr))] gap-4 min-w-full">
                {/* Time column header */}
                <div className="font-semibold text-olimpics-green-primary p-2">
                  Horário
                </div>
                
                {/* Date column headers */}
                {dates.map(date => (
                  <div key={date} className="font-semibold text-olimpics-green-primary p-2">
                    {format(new Date(date), "dd/MM/yyyy")}
                  </div>
                ))}

                {/* Get all unique time slots across all dates */}
                {Array.from(new Set(
                  Object.values(groupedActivities)
                    .flatMap(timeSlots => Object.keys(timeSlots))
                )).sort().map(timeSlot => {
                  const [start, end] = timeSlot.split('-');
                  return (
                    <React.Fragment key={timeSlot}>
                      {/* Time slot */}
                      <div className="flex items-center gap-1 text-sm text-gray-600 p-2">
                        <Clock className="h-4 w-4" />
                        {start.slice(0, 5)} - {end.slice(0, 5)}
                      </div>

                      {/* Activities for each date at this time slot */}
                      {dates.map(date => (
                        <div key={`${date}-${timeSlot}`} className="p-2">
                          {groupedActivities[date]?.[timeSlot]?.map((activity, index) => (
                            <div
                              key={activity.id}
                              className={`p-3 rounded-lg border mb-2 last:mb-0 ${
                                activity.is_registered
                                  ? 'border-olimpics-orange-primary bg-olimpics-orange-primary/10'
                                  : activity.global
                                  ? 'border-olimpics-green-primary bg-olimpics-green-primary/10'
                                  : 'border-gray-200'
                              }`}
                            >
                              <div className="space-y-1">
                                <h4 className="font-medium">{activity.atividade}</h4>
                                <div className="text-sm text-gray-600">
                                  <span>{activity.local}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
