
import React, { useEffect, useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Loader2 } from "lucide-react";
import { ScheduleTable } from './schedule/ScheduleTable';
import { useAuth } from "@/contexts/AuthContext";
import { ScheduleLegend } from './schedule/ScheduleLegend';

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
  modalidade_status: string | null;
  atleta_id: string;
}

interface GroupedActivities {
  [key: string]: {
    [key: string]: ScheduleActivity[];
  };
}

export default function AthleteSchedule() {
  const { user } = useAuth();
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);

  useEffect(() => {
    const eventId = localStorage.getItem('currentEventId');
    if (eventId) {
      setCurrentEventId(eventId);
    }
    console.log('Current event ID from localStorage:', eventId);
  }, []);

  const { data: activities, isLoading } = useQuery({
    queryKey: ['personal-schedule-activities', user?.id, currentEventId],
    queryFn: async () => {
      if (!user?.id || !currentEventId) return [];
      console.log('Fetching schedule activities for user:', user.id, 'event:', currentEventId);

      // First, get all global activities
      const { data: globalActivities, error: globalError } = await supabase
        .from('cronograma_atividades')
        .select(`
          id,
          atividade,
          horario_inicio,
          horario_fim,
          dia,
          local,
          global
        `)
        .eq('evento_id', currentEventId)
        .eq('global', true);

      if (globalError) {
        console.error('Error fetching global activities:', globalError);
        throw globalError;
      }

      // Then, get athlete-specific activities
      const { data: athleteActivities, error: athleteError } = await supabase
        .from('vw_cronograma_atividades_por_atleta')
        .select('*')
        .eq('atleta_id', user.id)
        .eq('evento_id', currentEventId);

      if (athleteError) {
        console.error('Error fetching athlete activities:', athleteError);
        throw athleteError;
      }

      // Combine and format activities
      const formattedGlobalActivities = globalActivities.map(activity => ({
        ...activity,
        modalidade_nome: null,
        modalidade_status: null,
        cronograma_atividade_id: activity.id,
        atleta_id: user.id
      }));

      const allActivities = [...formattedGlobalActivities, ...(athleteActivities || [])];
      console.log('Combined activities:', allActivities);
      
      return allActivities;
    },
    enabled: !!user?.id && !!currentEventId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-olimpics-green-primary" />
      </div>
    );
  }

  // Group activities by date and time
  const groupedActivities = activities?.reduce((groups: GroupedActivities, activity) => {
    const date = activity.dia;
    const time = `${activity.horario_inicio}-${activity.horario_fim}`;
    
    if (!groups[date]) {
      groups[date] = {};
    }
    
    if (!groups[date][time]) {
      groups[date][time] = [];
    }
    
    // Check if activity already exists to avoid duplicates
    const activityExists = groups[date][time].some(
      existingActivity => existingActivity.cronograma_atividade_id === activity.cronograma_atividade_id
    );
    
    if (!activityExists) {
      groups[date][time].push(activity);
    }
    
    return groups;
  }, {});

  const dates = Object.keys(groupedActivities || {}).sort();
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
      <CardContent className="space-y-4">
        <ScheduleLegend />
        <ScheduleTable 
          groupedActivities={groupedActivities || {}}
          dates={dates}
          timeSlots={timeSlots}
        />
      </CardContent>
    </Card>
  );
}
