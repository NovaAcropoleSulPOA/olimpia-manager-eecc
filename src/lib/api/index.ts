
export * from './athletes';
export * from './branches';
export * from './modalities';
export * from './payments';
export * from './profiles';
import { supabase } from '@/lib/supabase';

// Re-export types so components can still import them from @/lib/api
export type {
  AthleteModality,
  AthleteManagement,
  Branch,
  BranchAnalytics
} from '../../types/api';

export interface PaymentStatus {
  status_pagamento: string;
  quantidade: number;
}

export const fetchBranchAnalytics = async (eventId: string | null, filialId?: string) => {
  if (!eventId) return [];
  
  try {
    console.log('fetchBranchAnalytics called with eventId:', eventId, 'filialId:', filialId);
    
    // Instead of setting config, we'll use the eventId directly in our query
    let query = supabase
      .from('vw_analytics_inscricoes')
      .select('*')
      .eq('evento_id', eventId);
    
    // Apply filial filter only if provided (for delegation view)
    if (filialId) {
      console.log('Applying filial filter with ID:', filialId);
      query = query.eq('filial_id', filialId);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.warn('No analytics data found for event:', eventId, 'with filial filter:', filialId);
      
      // If no data is found through the view, let's create mock data for development/testing
      // This helps visualize what the UI should look like even if no data exists yet
      if (process.env.NODE_ENV === 'development') {
        console.log('Creating mock data for development');
        
        const mockData = [{
          filial_id: filialId || 'mock-filial-id',
          filial: 'Filial Exemplo',
          evento_id: eventId,
          total_inscritos_geral: 15,
          total_inscritos_modalidades: 25,
          valor_total_pago: 1500,
          valor_total_pendente: 500,
          modalidades_populares: [
            { modalidade: 'Atletismo', total_inscritos: 5 },
            { modalidade: 'Natação', total_inscritos: 8 }
          ],
          total_inscritos_por_status: [
            { status_pagamento: 'confirmado', quantidade: 10 },
            { status_pagamento: 'pendente', quantidade: 5 }
          ],
          inscritos_por_status_pagamento: [
            { status_pagamento: 'confirmado', quantidade: 10 },
            { status_pagamento: 'pendente', quantidade: 5 }
          ],
          ranking_filiais: [{ total_pontos: 120 }],
          atletas_por_categoria: [
            { categoria: 'Masculino', quantidade: 8 },
            { categoria: 'Feminino', quantidade: 7 }
          ],
          media_pontuacao_por_modalidade: [
            { modalidade: 'Atletismo', media_pontuacao: 8.5 },
            { modalidade: 'Natação', media_pontuacao: 9.2 }
          ]
        }];
        
        return mockData;
      }
    } else {
      console.log('Analytics data retrieved:', data.length, 'records');
    }

    // Ensure returned data has the correct structure
    return data?.map(item => ({
      ...item,
      // Make sure arrays are properly initialized even if null in database
      modalidades_populares: item.modalidades_populares || [],
      total_inscritos_por_status: item.total_inscritos_por_status || [],
      inscritos_por_status_pagamento: item.inscritos_por_status_pagamento || [],
      ranking_filiais: item.ranking_filiais ? [item.ranking_filiais] : [{ total_pontos: 0 }],
      atletas_por_categoria: item.atletas_por_categoria || [],
      media_pontuacao_por_modalidade: item.media_pontuacao_por_modalidade || []
    })) || [];
  } catch (error) {
    console.error('Error in fetchBranchAnalytics:', error);
    throw error;
  }
};
