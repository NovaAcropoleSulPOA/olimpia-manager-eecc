
import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Loader2 } from "lucide-react";
import { ScheduleTable } from './schedule/ScheduleTable';
import { useAuth } from "@/contexts/AuthContext";

interface ScheduleActivity {
  id: number;
  cronograma_atividade_id: number;
  atividade: string;
  horario_inicio: string;
  horario_fim: string;
  dia: string;
  local: string;
  global: boolean;
  modalidade_nome: string | null;
  atleta_id: string;
}

interface GroupedActivities {
  [key: string]: {
    [key: string]: ScheduleActivity[];
  };
}

export default function AthleteSchedule() {
  const { user } = useAuth();

  const { data: activities, isLoading } = useQuery({
    queryKey: ['personal-schedule-activities', user?.id],
    queryFn: async () => {
      console.log('Fetching personal schedule activities for user:', user?.id);
      const { data, error } = await supabase
        .from('vw_cronograma_atividades_por_atleta')
        .select('*')
        .eq('atleta_id', user?.id)
        .order('dia')
        .order('horario_inicio');

      if (error) {
        console.error('Error fetching personal schedule:', error);
        throw error;
      }

      console.log('Retrieved personal schedule activities:', data);
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
    
    if (!groups[date][time].some(existingActivity => existingActivity.cronograma_atividade_id === activity.cronograma_atividade_id)) {
      groups[date][time].push(activity);
    }
    
    return groups;
  }, {} as GroupedActivities) || {};

  // Get unique dates
  const dates = Object.keys(groupedActivities).sort();

  // Get unique time slots from activities that have actual data
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
          Meu Cronograma de Atividades
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
