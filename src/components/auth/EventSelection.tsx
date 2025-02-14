
import { Button } from "@/components/ui/button";
import { Loader2, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { PerfilTipo } from "@/lib/types/database";
import { EventCarousel } from "./event-selection/EventCarousel";
import { useEventQuery } from "./event-selection/useEventQuery";
import { useEventRegistration } from "./event-selection/useEventRegistration";

interface EventSelectionProps {
  selectedEvents: string[];
  onEventSelect: (eventId: string) => void;
  mode: 'registration' | 'login';
  userProfileType?: string | null;
}

export const EventSelection = ({ 
  selectedEvents, 
  onEventSelect, 
  mode,
  userProfileType
}: EventSelectionProps) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [selectedRole, setSelectedRole] = useState<PerfilTipo>('PGR');
  
  const { data: events, isLoading } = useEventQuery(user?.id);
  const registerEventMutation = useEventRegistration(user?.id);

  const handleEventRegistration = async (eventId: string) => {
    try {
      await registerEventMutation.mutateAsync({ eventId, selectedRole });
      navigate('/athlete-profile');
    } catch (error) {
      console.error('Error in handleEventRegistration:', error);
    }
  };

  const handleEventSelect = (eventId: string, isRegistered: boolean) => {
    localStorage.setItem('currentEventId', eventId);
    if (isRegistered) {
      navigate('/athlete-profile');
    }
  };

  const handleExit = async () => {
    try {
      await signOut();
      localStorage.removeItem('currentEventId');
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Erro ao fazer logout. Tente novamente.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-olimpics-green-primary" />
      </div>
    );
  }

  if (!events?.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="text-center text-gray-500">
          {mode === 'registration' 
            ? 'Não há eventos com inscrições abertas no momento.'
            : 'Você ainda não está inscrito em nenhum evento.'}
        </div>
        <Button
          onClick={handleExit}
          variant="outline"
          className="flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </div>
    );
  }

  // Filter events based on user's profile type if they are a child
  const filteredEvents = events.map(event => ({
    ...event,
    modalities: event.modalities?.filter(modality => {
      if (userProfileType && ['C+7', 'C-6'].includes(userProfileType)) {
        return modality.faixa_etaria === 'infantil';
      }
      return true;
    })
  }));

  return (
    <div className="space-y-6">
      <EventCarousel
        events={filteredEvents}
        selectedRole={selectedRole}
        onRoleChange={setSelectedRole}
        onEventAction={(eventId) => {
          const event = events.find(e => e.id === eventId);
          if (event?.isRegistered) {
            handleEventSelect(eventId, true);
          } else {
            handleEventRegistration(eventId);
          }
        }}
      />
      <div className="flex justify-center">
        <Button
          onClick={handleExit}
          variant="outline"
          className="flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </div>
    </div>
  );
};
