
import { supabase } from '../supabase';
import type { Branch, BranchAnalytics } from '../../types/api';

export const fetchBranches = async (): Promise<Branch[]> => {
  console.log('Fetching branches...');
  const { data, error } = await supabase
    .from('filiais')
    .select('*');

  if (error) {
    console.error('Error fetching branches:', error);
    throw error;
  }

  return data || [];
};

export const fetchBranchAnalytics = async (eventId: string | null): Promise<BranchAnalytics[]> => {
  console.log('Fetching branch analytics from view for event:', eventId);
  try {
    if (!eventId) return [];
    
    const { data, error } = await supabase
      .from('vw_analytics_inscricoes')
      .select('*')
      .eq('evento_id', eventId);

    if (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }

    if (!data) {
      console.log('No data returned from analytics view');
      return [];
    }

    // Parse JSON fields that come as strings
    const formattedData = data.map(row => ({
      ...row,
      inscritos_por_status_pagamento: typeof row.inscritos_por_status_pagamento === 'string' 
        ? JSON.parse(row.inscritos_por_status_pagamento)
        : row.inscritos_por_status_pagamento,
      modalidades_populares: typeof row.modalidades_populares === 'string'
        ? JSON.parse(row.modalidades_populares)
        : row.modalidades_populares
    }));

    console.log('Branch analytics response:', formattedData);
    return formattedData;
  } catch (error) {
    console.error('Error in fetchBranchAnalytics:', error);
    throw error;
  }
};

