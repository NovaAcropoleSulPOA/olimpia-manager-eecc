
import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Loader2 } from "lucide-react";
import { ScheduleLegend } from './schedule/ScheduleLegend';
import { ScheduleTable } from './schedule/ScheduleTable';
import { useAuth } from "@/contexts/AuthContext";

export interface ScheduleActivity {
  id: number;
  atividade: string;
  horario_inicio: string;
  horario_fim: string;
  dia: string;
  local: string;
  is_registered: boolean;
  global: boolean;
  modalidade_nome: string | null;
  registration_status: string;
  modalidade_ids: number[] | null;
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
      console.log('Fetching schedule activities for user:', user?.id);
      const { data, error } = await supabase
        .from('vw_cronograma_atividades_usuario')
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
    if (!activity.dia) return groups;
    
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
      existingActivity => existingActivity.id === activity.id
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

  console.log('Grouped activities:', groupedActivities);
  console.log('Dates with activities:', dates);
  console.log('Time slots:', timeSlots);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-olimpics-green-primary flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Cronograma de Atividades
        </CardTitle>
        <ScheduleLegend />
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
