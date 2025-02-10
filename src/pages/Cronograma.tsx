
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { ScheduleTable } from '@/components/schedule/ScheduleTable';
import { Loader2 } from "lucide-react";

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

export default function Cronograma() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['cronograma-activities'],
    queryFn: async () => {
      console.log('Fetching cronograma activities');
      const { data, error } = await supabase
        .from('vw_cronograma_atividades')
        .select('*')
        .order('dia')
        .order('horario_inicio');

      if (error) {
        console.error('Error fetching cronograma:', error);
        throw error;
      }

      console.log('Retrieved cronograma activities:', data);
      return data as ScheduleActivity[];
    },
  });

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

  // Get unique dates
  const dates = Object.keys(groupedActivities).sort();

  // Get unique time slots
  const timeSlots = [...new Set(
    activities?.map(activity => `${activity.horario_inicio}-${activity.horario_fim}`)
  )].sort();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-olimpics-green-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-olimpics-green-primary flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Cronograma Geral do Evento
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
