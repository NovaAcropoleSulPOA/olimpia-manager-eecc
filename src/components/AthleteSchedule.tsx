
import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ChevronDown, Clock, CircleHelp } from "lucide-react";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    
    // Check if activity is already included to avoid duplicates
    const isDuplicate = groups[date][time].some(
      existingActivity => existingActivity.atividade === activity.atividade &&
      existingActivity.local === activity.local
    );
    
    if (!isDuplicate) {
      groups[date][time].push(activity);
    }
    
    return groups;
  }, {} as GroupedActivities) || {};

  // Get dates that have activities
  const dates = Object.keys(groupedActivities)
    .filter(date => Object.keys(groupedActivities[date]).length > 0)
    .sort();

  // Get all unique time slots
  const timeSlots = Array.from(new Set(
    Object.values(groupedActivities)
      .flatMap(timeSlots => Object.keys(timeSlots))
  )).sort();

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-olimpics-green-primary flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Cronograma de Atividades
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      <CircleHelp className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-500">Legenda</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-2 p-2">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-olimpics-orange-primary/30 border border-olimpics-orange-primary" />
                        <span className="text-sm">Atividades Inscritas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-olimpics-green-primary/30 border border-olimpics-green-primary" />
                        <span className="text-sm">Atividades Gerais</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-gray-100 border border-gray-200" />
                        <span className="text-sm">Outras Atividades</span>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <CollapsibleTrigger>
              <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
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
                                <div
                                  key={`${activity.id}-${index}`}
                                  className={`p-3 rounded-lg border ${
                                    activity.is_registered || activity.global
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
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
