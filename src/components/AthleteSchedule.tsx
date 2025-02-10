
import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Loader2 } from "lucide-react";
import { ScheduleTable } from './schedule/ScheduleTable';
import { useAuth } from "@/contexts/AuthContext";

interface ScheduleActivity {
  id: number;
  atividade: string;
  horario_inicio: string;
  horario_fim: string;
  dia: string;
  local: string;
  global: boolean;
  modalidade_nome: string | null;
}

interface GroupedActivities {
  [key: string]: {
    [key: string]: ScheduleActivity[];
  };
}

export default function AthleteSchedule() {
  const { user } = useAuth();

  const { data: activities, isLoading } = useQuery({
    queryKey: ['schedule-activities', user?.id],
    queryFn: async () => {
      console.log('Fetching schedule activities');
      const { data, error } = await supabase
        .from('vw_cronograma_atividades')
        .select('*')
        .order('dia')
        .order('horario_inicio');

      if (error) {
        console.error('Error fetching schedule:', error);
        throw error;
      }

      console.log('Retrieved schedule activities:', data);
      return data as ScheduleActivity[];
    },
    enabled: !!user?.id,
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
    
    if (!groups[date][time].some(existingActivity => existingActivity.id === activity.id)) {
      groups[date][time].push(activity);
    }
    
    return groups;
  }, {} as GroupedActivities) || {};

  // Get unique dates from activities array
  const dates = [...new Set(activities?.map(activity => activity.dia))]
    .filter(Boolean)
    .sort();

  // Get unique time slots from activities array
  const timeSlots = [...new Set(
    activities?.map(activity => `${activity.horario_inicio}-${activity.horario_fim}`)
  )].sort();

  console.log('Grouped activities:', groupedActivities);
  console.log('Dates with activities:', dates);
  console.log('Time slots:', timeSlots);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-olimpics-green-primary flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Cronograma de Atividades
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScheduleTable 
          groupedActivities={groupedActivities}
          dates={dates}
          timeSlots={timeSlots}
        />
      </CardContent>
    </Card>
  );
}
