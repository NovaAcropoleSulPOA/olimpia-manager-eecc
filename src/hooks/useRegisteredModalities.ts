
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { RegisteredModality } from "@/types/modality";

export const useRegisteredModalities = (userId: string | undefined, eventId: string | null) => {
  return useQuery({
    queryKey: ['athlete-modalities', userId, eventId],
    queryFn: async () => {
      if (!userId || !eventId) return [];
      console.log('Fetching modalities for athlete:', userId, 'event:', eventId);
      
      const { data, error } = await supabase
        .from('inscricoes_modalidades')
        .select(`
          id,
          status,
          data_inscricao,
          modalidade:modalidades!inner (
            id,
            nome,
            categoria,
            tipo_modalidade
          )
        `)
        .eq('atleta_id', userId)
        .eq('evento_id', eventId);
      
      if (error) {
        console.error('Error fetching athlete modalities:', error);
        throw error;
      }

      const transformedData = (data || []).map((item: any) => ({
        id: item.id,
        status: item.status,
        data_inscricao: item.data_inscricao,
        modalidade: {
          id: item.modalidade.id,
          nome: item.modalidade.nome,
          categoria: item.modalidade.categoria,
          tipo_modalidade: item.modalidade.tipo_modalidade
        }
      }));

      console.log('Retrieved athlete modalities:', transformedData);
      return transformedData;
    },
    enabled: !!userId && !!eventId,
  });
};
