
import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { Loader2 } from "lucide-react";
import { ScheduleTable } from './schedule/ScheduleTable';

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

export default function AthleteSchedule() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['schedule-activities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vw_cronograma_atividades')
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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
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
