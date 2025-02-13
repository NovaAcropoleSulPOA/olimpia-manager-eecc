
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Event } from "@/lib/types/database";

interface TransformedRole {
  nome: string;
  codigo: string;
}

export const useEventQuery = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['active-events'],
    queryFn: async () => {
      if (!userId) {
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
        .eq('id', userId)
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
        .eq('usuario_id', userId);

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

      // Fetch admin status for each event
      const adminStatusPromises = events.data?.map(async (event) => {
        const { data: isAdmin } = await supabase.rpc('is_event_admin', {
          user_id: userId,
          event_id: event.id
        });
        return { eventId: event.id, isAdmin: isAdmin || false };
      }) || [];

      const adminStatuses = await Promise.all(adminStatusPromises);
      const adminStatusMap = Object.fromEntries(
        adminStatuses.map(({ eventId, isAdmin }) => [eventId, isAdmin])
      );

      const userRolesPromises = registeredEventIds.map(async (eventId) => {
        const { data: roles, error } = await supabase
          .from('papeis_usuarios')
          .select(`
            id,
            perfil_id,
            perfis (
              nome,
              perfis_tipo:perfil_tipo_id (
                codigo
              )
            )
          `)
          .eq('usuario_id', userId)
          .eq('evento_id', eventId);

        if (error) {
          console.error('Error fetching user roles:', error);
          return { eventId, roles: [] };
        }

        const transformedRoles: TransformedRole[] = (roles || []).map((role: any) => ({
          nome: role.perfis.nome,
          codigo: role.perfis.perfis_tipo?.codigo || ''
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
          isAdmin: adminStatusMap[event.id] || false,
          roles: userRolesMap[event.id] || [],
          isOpen: startDate <= currentDate && currentDate <= endDate
        };
      });
      
      console.log('Final events with status:', eventsWithStatus);
      return eventsWithStatus || [];
    },
    enabled: !!userId,
  });
};
