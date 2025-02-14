
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const useEventQuery = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['active-events', userId],
    queryFn: async () => {
      if (!userId) {
        console.log('No user ID provided');
        return [];
      }

      // First get the user's branch ID
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('filial_id')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Error fetching user branch:', userError);
        throw userError;
      }

      if (!userData?.filial_id) {
        console.log('User has no branch assigned');
        return [];
      }

      // Get all events where the user's branch is permitted
      const { data: branchEvents, error: branchEventsError } = await supabase
        .from('eventos_filiais')
        .select(`
          evento_id,
          eventos (
            *,
            modalidades (
              id,
              nome,
              categoria,
              tipo_modalidade,
              faixa_etaria,
              limite_vagas,
              vagas_ocupadas
            )
          )
        `)
        .eq('filial_id', userData.filial_id);

      if (branchEventsError) {
        console.error('Error fetching branch events:', branchEventsError);
        throw branchEventsError;
      }

      // Get user's registered events
      const { data: registeredEvents, error: registeredError } = await supabase
        .from('inscricoes_eventos')
        .select('evento_id')
        .eq('usuario_id', userId);

      if (registeredError) {
        console.error('Error fetching registered events:', registeredError);
        throw registeredError;
      }

      // Get user's roles for each event
      const { data: userRoles, error: rolesError } = await supabase
        .from('papeis_usuarios')
        .select(`
          evento_id,
          perfis (
            nome,
            codigo
          )
        `)
        .eq('usuario_id', userId);

      if (rolesError) {
        console.error('Error fetching user roles:', rolesError);
        throw rolesError;
      }

      // Process and filter events
      const events = branchEvents
        .map(be => be.eventos)
        .filter(event => {
          if (!event) return false;

          const isRegistered = registeredEvents?.some(reg => reg.evento_id === event.id);
          const userRolesForEvent = userRoles?.filter(role => role.evento_id === event.id)
            .map(role => ({
              nome: role.perfis?.nome,
              codigo: role.perfis?.codigo
            }));

          // Include event if:
          // 1. It's active, OR
          // 2. User is registered in it (regardless of status)
          return event.status_evento === 'ativo' || 
                 (isRegistered && ['encerrado', 'suspenso'].includes(event.status_evento));
        })
        .map(event => ({
          ...event,
          isRegistered: registeredEvents?.some(reg => reg.evento_id === event.id) || false,
          roles: userRoles?.filter(role => role.evento_id === event.id)
            .map(role => ({
              nome: role.perfis?.nome,
              codigo: role.perfis?.codigo
            })) || [],
          isOpen: event?.status_evento === 'ativo',
          isAdmin: userRoles?.some(role => 
            role.evento_id === event?.id && 
            role.perfis?.nome === 'Administrador'
          ) || false
        }));

      console.log('Processed events:', events);
      return events || [];
    },
    enabled: !!userId
  });
};
