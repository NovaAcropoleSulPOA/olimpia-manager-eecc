
import { ArrowLeftRight } from 'lucide-react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuItem, SidebarMenuButton } from '../ui/sidebar';

interface EventSwitcherProps {
  userId: string;
  collapsed?: boolean;
}

export function EventSwitcher({ userId, collapsed = false }: EventSwitcherProps) {
  const { data: userEvents } = useQuery({
    queryKey: ['user-events', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('inscricoes_eventos')
        .select(`
          evento_id,
          eventos (
            id,
            nome,
            status_evento
          )
        `)
        .eq('usuario_id', userId);

      if (error) {
        console.error('Error fetching user events:', error);
        throw error;
      }

      return data.map(item => item.eventos);
    },
    enabled: !!userId
  });

  const handleEventSwitch = (eventId: string) => {
    localStorage.setItem('currentEventId', eventId);
    window.location.reload(); // Reload to refresh all queries with new event
  };

  if (!userEvents || userEvents.length <= 1) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          className="w-full rounded-lg p-4 flex items-center gap-3 
            text-white hover:bg-olimpics-green-secondary/20 
            transition-all duration-200 text-lg font-medium mb-2"
          tooltip={collapsed ? "Trocar Evento" : undefined}
        >
          <ArrowLeftRight className="h-7 w-7 flex-shrink-0 mr-3" />
          <span className={`whitespace-nowrap ${collapsed ? 'hidden' : 'block'}`}>Trocar Evento</span>
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {userEvents.map((event: any) => (
          <DropdownMenuItem
            key={event.id}
            onClick={() => handleEventSwitch(event.id)}
            className="cursor-pointer"
          >
            {event.nome}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
