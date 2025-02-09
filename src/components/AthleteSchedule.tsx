
import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

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

export default function AthleteSchedule() {
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

  // Group activities by date
  const groupedActivities = activities?.reduce((groups, activity) => {
    const date = activity.dia;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {} as Record<string, ScheduleActivity[]>) || {};

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-olimpics-green-primary flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Cronograma de Atividades
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(groupedActivities).map(([date, dayActivities]) => (
            <div key={date} className="space-y-4">
              <h3 className="text-lg font-semibold text-olimpics-green-primary">
                {format(new Date(date), "dd/MM/yyyy")}
              </h3>
              <div className="space-y-2">
                {dayActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className={`p-4 rounded-lg border ${
                      activity.is_registered
                        ? 'border-olimpics-orange-primary bg-olimpics-orange-primary/10'
                        : activity.global
                        ? 'border-olimpics-green-primary bg-olimpics-green-primary/10'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex flex-col gap-2">
                      <h4 className="font-medium">{activity.atividade}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {activity.horario_inicio.slice(0, 5)} - {activity.horario_fim.slice(0, 5)}
                        </span>
                        <span>{activity.local}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
