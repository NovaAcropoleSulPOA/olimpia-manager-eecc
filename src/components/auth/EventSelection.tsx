
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Loader2, Trophy, LogOut } from "lucide-react";
import { format } from "date-fns";
import { Event } from "@/lib/types/database";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface EventSelectionProps {
  selectedEvents: string[];
  onEventSelect: (eventId: string) => void;
  mode: 'registration' | 'login';
}

interface UserRole {
  perfis: {
    nome: string;
    perfil_tipo: {
      codigo: string;
    };
  }[];
}

export const EventSelection = ({ selectedEvents, onEventSelect, mode }: EventSelectionProps) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<'ATL' | 'PGR'>('PGR'); // Using profile type codes
  
  const { data: events, isLoading } = useQuery({
    queryKey: ['active-events'],
    queryFn: async () => {
      if (!user?.id) {
        console.error('No user ID available');
        return [];
      }

      // Get current date in Brazil timezone
      const brasiliaDate = new Date().toLocaleString("en-US", {
        timeZone: "America/Sao_Paulo"
      });
      const today = new Date(brasiliaDate).toISOString().split('T')[0];
      console.log('Current Brasília date:', today);

      // First, get user's branch
      const { data: userBranch, error: branchError } = await supabase
        .from('usuarios')
        .select('filial_id')
        .eq('id', user.id)
        .single();

      if (branchError) {
        console.error('Error fetching user branch:', branchError);
        throw branchError;
      }

      console.log('User branch:', userBranch);

      // Get user's registered events
      const { data: registeredEvents, error: registrationError } = await supabase
        .from('inscricoes_eventos')
        .select('evento_id')
        .eq('usuario_id', user.id);

      if (registrationError) {
        console.error('Error fetching registered events:', registrationError);
        throw registrationError;
      }

      const registeredEventIds = (registeredEvents || []).map(reg => reg.evento_id);
      console.log('User registered events:', registeredEventIds);

      // Fetch events with proper filtering
      const { data: events, error: eventsError } = await supabase
        .from('eventos')
        .select(`
          *,
          eventos_filiais!inner (filial_id)
        `)
        .eq('eventos_filiais.filial_id', userBranch.filial_id)
        .or(`and(data_inicio_inscricao.lte.${today},data_fim_inscricao.gte.${today}),id.in.(${registeredEventIds.length > 0 ? registeredEventIds.join(',') : 'null'})`);

      if (eventsError) {
        console.error('Error fetching events:', eventsError);
        throw eventsError;
      }

      console.log('Events after initial filtering:', events);

      // Then get user roles for each event
      const userRolesPromises = registeredEventIds.map(async (eventId) => {
        const { data: roles } = await supabase
          .from('papeis_usuarios')
          .select(`
            perfis:perfil_id (
              nome,
              perfil_tipo:perfil_tipo_id (
                codigo
              )
            )
          `)
          .eq('usuario_id', user.id)
          .eq('evento_id', eventId);
        
        const roleNames = (roles as UserRole[] || []).flatMap(role => 
          role.perfis.map(perfil => ({
            nome: perfil.nome,
            codigo: perfil.perfil_tipo?.codigo || ''
          }))
        );
        return { eventId, roles: roleNames };
      });

      const userRoles = await Promise.all(userRolesPromises);
      const userRolesMap = Object.fromEntries(
        userRoles.map(({ eventId, roles }) => [eventId, roles])
      );
      
      // Add isRegistered, roles and isOpen flags to each event
      const eventsWithStatus = events?.map(event => {
        const startDate = new Date(event.data_inicio_inscricao);
        const endDate = new Date(event.data_fim_inscricao);
        const currentDate = new Date(brasiliaDate);
        
        const eventWithStatus = {
          ...event,
          isRegistered: registeredEventIds.includes(event.id),
          roles: userRolesMap[event.id] || [],
          isOpen: startDate <= currentDate && currentDate <= endDate
        };

        console.log(`Event ${event.id} status:`, {
          name: event.nome,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          currentDate: currentDate.toISOString(),
          isRegistered: eventWithStatus.isRegistered,
          roles: eventWithStatus.roles
        });

        return eventWithStatus;
      });
      
      console.log('Final events with status:', eventsWithStatus);
      return eventsWithStatus || [];
    },
    enabled: !!user?.id,
  });

  const registerEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const { data: profileTypeId } = await supabase
        .from('perfis_tipo')
        .select('id')
        .eq('codigo', selectedRole)
        .single();

      if (!profileTypeId) {
        throw new Error('Profile type not found');
      }

      const { data, error } = await supabase
        .from('inscricoes_eventos')
        .insert([
          {
            evento_id: eventId,
            usuario_id: user?.id,
            selected_role: selectedRole
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error registering for event:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      toast.success('Inscrição realizada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['active-events'] });
    },
    onError: (error) => {
      console.error('Registration error:', error);
      toast.error('Erro ao realizar inscrição. Tente novamente.');
    }
  });

  const handleEventRegistration = async (eventId: string) => {
    try {
      await registerEventMutation.mutateAsync(eventId);
      onEventSelect(eventId);
    } catch (error) {
      console.error('Error in handleEventRegistration:', error);
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

  return (
    <div className="space-y-6">
      <div className="relative w-full">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {events.map((event) => (
              <CarouselItem key={event.id} className="md:basis-1/3">
                <Card 
                  className={`
                    relative overflow-hidden transition-all duration-200 hover:shadow-lg mx-2
                    ${event.isRegistered ? 'ring-2 ring-olimpics-green-primary' : ''}
                  `}
                >
                  <CardContent className="p-6">
                    <div className="aspect-square rounded-lg mb-4 relative overflow-hidden bg-olimpics-green-primary/10">
                      {event.foto_evento ? (
                        <img
                          src={event.foto_evento}
                          alt={event.nome}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Trophy className="w-16 h-16 text-olimpics-green-primary/50" />
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{event.nome}</h3>
                    <p className="text-sm text-gray-500 mb-4">{event.descricao}</p>
                    <div className="space-y-1 text-sm text-gray-500 mb-4">
                      <p>Início: {format(new Date(event.data_inicio_inscricao), 'dd/MM/yyyy')}</p>
                      <p>Término: {format(new Date(event.data_fim_inscricao), 'dd/MM/yyyy')}</p>
                      <p className="text-xs uppercase font-medium mt-2">{event.tipo}</p>
                      {event.isRegistered && event.roles.length > 0 && (
                        <p className="text-xs font-medium text-olimpics-green-primary mt-1">
                          Papéis: {event.roles.map(role => role.nome).join(', ')}
                        </p>
                      )}
                    </div>
                    {!event.isRegistered && event.isOpen && (
                      <div className="mb-4">
                        <RadioGroup
                          value={selectedRole}
                          onValueChange={(value) => setSelectedRole(value as 'ATL' | 'PGR')}
                          className="space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="ATL" id={`atleta-${event.id}`} />
                            <Label htmlFor={`atleta-${event.id}`}>Atleta</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="PGR" id={`publico-${event.id}`} />
                            <Label htmlFor={`publico-${event.id}`}>Público Geral</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    )}
                    <Button
                      onClick={() => event.isRegistered ? onEventSelect(event.id) : handleEventRegistration(event.id)}
                      variant={event.isRegistered ? "default" : "outline"}
                      className="w-full"
                      disabled={!event.isOpen && !event.isRegistered}
                    >
                      {event.isRegistered 
                        ? 'Acessar evento' 
                        : event.isOpen 
                          ? 'Quero me cadastrar'
                          : 'Inscrições encerradas'}
                    </Button>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
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
