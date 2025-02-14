
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const useEventQuery = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['active-events', userId],
    queryFn: async () => {
      // First get all active events
      const { data: events, error: eventsError } = await supabase
        .from('eventos')
        .select(`
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
        `)
        .eq('status_evento', 'ativo');

      if (eventsError) throw eventsError;

      if (!userId) return events || [];

      // Then get user's registered events
      const { data: registeredEvents, error: registeredError } = await supabase
        .from('inscricoes_eventos')
        .select('evento_id')
        .eq('usuario_id', userId);

      if (registeredError) throw registeredError;

      // Mark events as registered or not
      return events?.map(event => ({
        ...event,
        isRegistered: registeredEvents?.some(reg => reg.evento_id === event.id) || false
      })) || [];
    },
    enabled: true
  });
};
