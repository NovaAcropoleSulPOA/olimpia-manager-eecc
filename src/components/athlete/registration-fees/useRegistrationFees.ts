
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Fee } from './types';

export function useRegistrationFees(eventId: string | null) {
  return useQuery({
    queryKey: ['registration-fees', eventId],
    queryFn: async () => {
      console.log('Fetching fees for event:', eventId);
      
      if (!eventId) return [];
      
      const { data, error } = await supabase
        .from('taxas_inscricao')
        .select(`
          id,
          valor,
          isento,
          pix_key,
          data_limite_inscricao,
          contato_nome,
          contato_telefone,
          qr_code_image,
          qr_code_codigo,
          link_formulario,
          perfil:perfis (
            nome,
            id
          )
        `)
        .eq('evento_id', eventId);

      if (error) {
        console.error('Error fetching registration fees:', error);
        throw error;
      }

      // Transform the data to match our Fee interface
      const transformedData = (data || []).map(item => ({
        ...item,
        perfil: Array.isArray(item.perfil) ? item.perfil[0] : item.perfil
      }));

      console.log('Raw fees data:', data);
      console.log('Transformed fees:', transformedData);
      return transformedData as Fee[];
    },
    enabled: !!eventId
  });
}
