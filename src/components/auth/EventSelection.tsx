import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Loader2, Trophy, LogOut } from "lucide-react";
import { format } from "date-fns";
import { Event, PerfilTipo } from "@/lib/types/database";
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

interface SupabaseUserRole {
  id: number;
  perfil_id: number;
  perfis: {
    nome: string;
    perfil_tipo: {
      codigo: string;
    };
  };
}

interface TransformedRole {
  nome: string;
  codigo: string;
}

export const EventSelection = ({ selectedEvents, onEventSelect, mode }: EventSelectionProps) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<PerfilTipo>('PGR');

  const { data: events, isLoading } = useQuery({
    queryKey: ['active-events'],
    queryFn: async () => {
      if (!user?.id) {
        console.error('No user ID available');
        return [];
      }

      const brasiliaDate = new Date().toLocaleString("en-US", {
        timeZone: "America/Sao_Paulo"
      });
      const today = new Date(brasiliaDate).toISOString().split('T')[0];
      console.log('Current Brasília date:', today);

      const userBranch = await supabase
        .from('usuarios')
        .select('filial_id')
        .eq('id', user.id)
        .single();

      if (userBranch.error) {
        console.error('Error fetching user branch:', userBranch.error);
        throw userBranch.error;
      }

      const filialId = userBranch.data?.filial_id;
      if (!filialId) {
        throw new Error('User branch not found');
      }

      const registeredEvents = await supabase
        .from('inscricoes_eventos')
        .select('evento_id')
        .eq('usuario_id', user.id);

      if (registeredEvents.error) {
        console.error('Error fetching registered events:', registeredEvents.error);
        throw registeredEvents.error;
      }

      const registeredEventIds = registeredEvents.data.map(reg => reg.evento_id);
      console.log('User registered events:', registeredEventIds);

      const events = await supabase
        .from('eventos')
        .select(`
          *,
          eventos_filiais!inner (filial_id)
        `)
        .eq('eventos_filiais.filial_id', filialId)
        .or(`and(data_inicio_inscricao.lte.${today},data_fim_inscricao.gte.${today}),id.in.(${registeredEventIds.length > 0 ? registeredEventIds.join(',') : 'null'})`);

      if (events.error) {
        console.error('Error fetching events:', events.error);
        throw events.error;
      }

      const userRolesPromises = registeredEventIds.map(async (eventId) => {
        const { data: roles, error } = await supabase
          .from('papeis_usuarios')
          .select(`
            id,
            perfil_id,
            perfis (
              nome,
              perfil_tipo:perfil_tipo_id (
                codigo
              )
            )
          `)
          .eq('usuario_id', user.id)
          .eq('evento_id', eventId);

        if (error) {
          console.error('Error fetching user roles:', error);
          return { eventId, roles: [] };
        }

        const transformedRoles: TransformedRole[] = (roles || []).map((role: any) => ({
          nome: role.perfis.nome,
          codigo: role.perfis.perfil_tipo.codigo
        }));

        return { eventId, roles: transformedRoles };
      });

      const userRoles = await Promise.all(userRolesPromises);
      const userRolesMap = Object.fromEntries(
        userRoles.map(({ eventId, roles }) => [eventId, roles])
      );
      
      const eventsWithStatus = events.data?.map(event => {
        const startDate = new Date(event.data_inicio_inscricao);
        const endDate = new Date(event.data_fim_inscricao);
        const currentDate = new Date(brasiliaDate);
        
        return {
          ...event,
          isRegistered: registeredEventIds.includes(event.id),
          roles: userRolesMap[event.id] || [],
          isOpen: startDate <= currentDate && currentDate <= endDate
        };
      });
      
      console.log('Final events with status:', eventsWithStatus);
      return eventsWithStatus || [];
    },
    enabled: !!user?.id,
  });

  const registerEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      if (!user?.id) throw new Error('No user ID available');

      console.log('Fetching registration fee for event:', eventId, 'and role:', selectedRole);

      const { data: registrationFee, error: feeError } = await supabase
        .from('taxas_inscricao')
        .select(`
          id,
          valor,
          perfis!fk_taxas_inscricao_perfil (
            nome,
            perfil_tipo!inner (
              codigo
            )
          )
        `)
        .eq('evento_id', eventId)
        .eq('perfis.perfil_tipo.codigo', selectedRole)
        .single();

      if (feeError) {
        console.error('Error fetching registration fee:', feeError);
        throw new Error('Taxa de inscrição não encontrada para o perfil selecionado');
      }

      if (!registrationFee) {
        throw new Error('Taxa de inscrição não encontrada para o perfil selecionado');
      }

      console.log('Found registration fee:', registrationFee);

      const { data: registration, error: registrationError } = await supabase
        .from('inscricoes_eventos')
        .insert([
          {
            evento_id: eventId,
            usuario_id: user.id,
            selected_role: selectedRole,
            taxa_inscricao_id: registrationFee.id
          }
        ])
        .select()
        .single();

      if (registrationError) {
        console.error('Error registering for event:', registrationError);
        throw registrationError;
      }

      return registration;
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
