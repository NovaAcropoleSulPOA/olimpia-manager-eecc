
import React, { useEffect, useState } from 'react';
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

      const { data, error } = await supabase
        .from('vw_cronograma_atividades_por_atleta')
        .select('*')
        .eq('evento_id', currentEventId)
        .or(`atleta_id.eq.${user.id},global.eq.true`)
        .order('dia')
        .order('horario_inicio');

      if (error) {
        console.error('Error fetching activities:', error);
        throw error;
      }

      console.log('Retrieved activities:', data);
      return data || [];
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
    
    groups[date][time].push({
      ...activity,
      id: activity.cronograma_atividade_id
    });
    
    return groups;
  }, {});

  const dates = Object.keys(groupedActivities || {}).sort();
  const timeSlots = [...new Set(
    activities?.map(activity => `${activity.horario_inicio}-${activity.horario_fim}`)
  )].sort();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-olimpics-green-primary flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Meu Cronograma de Atividades
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScheduleTable 
          groupedActivities={groupedActivities || {}}
          dates={dates}
          timeSlots={timeSlots}
        />
      </CardContent>
    </Card>
  );
}
