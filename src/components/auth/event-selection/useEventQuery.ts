
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const useEventQuery = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['active-events', userId],
    queryFn: async () => {
      if (!userId) {
        console.log('No user ID provided for event query');
        return [];
      }

      // Get user's branch ID
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('filial_id')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Error fetching user branch:', userError);
        throw userError;
      }

      const filialId = userData?.filial_id;

      // Get events available for user's branch
      const { data: events, error: eventsError } = await supabase
        .from('eventos')
        .select(`
          *,
          eventos_filiais!inner (
            filial_id
          ),
          modalidades (
            id,
            nome,
            categoria,
            tipo_modalidade,
            faixa_etaria,
            limite_vagas,
            vagas_ocupadas,
            status
          )
        `)
        .eq('eventos_filiais.filial_id', filialId)
        .eq('status_evento', 'ativo');

      if (eventsError) {
        console.error('Error fetching events:', eventsError);
        throw eventsError;
      }

      if (!events) {
        console.log('No events found');
        return [];
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

      // Process and return events with additional information
      return events.map(event => ({
        ...event,
        isRegistered: registeredEvents?.some(reg => reg.evento_id === event.id) || false,
        isOpen: new Date(event.data_fim_inscricao) > new Date(),
        isAdmin: false, // This will be handled by the role system if needed
        roles: [
          { nome: 'Atleta', codigo: 'ATL' },
          { nome: 'Público Geral', codigo: 'PGR' }
        ]
      }));
    },
    enabled: !!userId
  });
};
