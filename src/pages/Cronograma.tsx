
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ChevronUp, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { ScheduleTable } from '@/components/schedule/ScheduleTable';
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
}

interface GroupedActivities {
  [key: string]: {
    [key: string]: ScheduleActivity[];
  };
}

export default function Cronograma() {
  const [isVideoVisible, setIsVideoVisible] = useState(true);
  const currentEventId = localStorage.getItem('currentEventId');

  const { data: activities, isLoading } = useQuery({
    queryKey: ['cronograma-activities', currentEventId],
    queryFn: async () => {
      console.log('Fetching cronograma activities');
      const { data, error } = await supabase
        .from('vw_cronograma_atividades')
        .select('*')
        .eq('evento_id', currentEventId)
        .order('dia')
        .order('horario_inicio');

      if (error) {
        console.error('Error fetching cronograma:', error);
        throw error;
      }

      console.log('Retrieved cronograma activities:', data);
      return data as ScheduleActivity[];
    },
    enabled: !!currentEventId,
  });

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

  // Get unique dates
  const dates = Object.keys(groupedActivities || {}).sort();

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
    <div className="space-y-6">
      <div className="relative">
        <div className={`transition-all duration-300 ease-in-out ${isVideoVisible ? 'h-[500px] opacity-100' : 'h-0 opacity-0 overflow-hidden'}`}>
          <div className="w-full h-full rounded-lg overflow-hidden shadow-lg">
            <iframe
              src="https://www.youtube.com/embed/OSHPBjTutP4?si=LKjz9U5obrt8f9ZI"
              title="Cronograma Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsVideoVisible(!isVideoVisible)}
                className="absolute top-2 right-2 gap-2 bg-olimpics-green-primary text-white hover:bg-olimpics-green-secondary transition-colors font-medium"
              >
                {isVideoVisible ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Ocultar vídeo
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Mostrar vídeo
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isVideoVisible ? 'Clique para ocultar o vídeo' : 'Clique para mostrar o vídeo'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-olimpics-green-primary flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Cronograma Geral do Evento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScheduleTable 
            groupedActivities={groupedActivities || {}}
            dates={dates}
            timeSlots={timeSlots}
          />
        </CardContent>
      </Card>
    </div>
  );
}
