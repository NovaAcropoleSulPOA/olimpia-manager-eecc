
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
    
    // First, let's verify the event ID exists
    const { data: eventExists, error: eventError } = await supabase
      .from('eventos')
      .select('id')
      .eq('id', eventId)
      .single();

    if (eventError || !eventExists) {
      console.error('Event not found:', eventError);
      return [];
    }

    // Set the current event ID in session
    const { error: configError } = await supabase.rpc('set_current_event', {
      p_event_id: eventId
    });

    if (configError) {
      console.error('Error setting current event:', configError);
      // We'll continue anyway but log the error
    }

    // Now query the analytics view
    const { data, error } = await supabase
      .from('vw_analytics_inscricoes')
      .select('*')
      .eq('evento_id', eventId);

    if (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('No data returned from analytics view');
      // Let's verify if we have any filiais for this event
      const { data: eventBranches, error: branchError } = await supabase
        .from('eventos_filiais')
        .select('filial_id')
        .eq('evento_id', eventId);

      console.log('Event branches:', eventBranches?.length || 0);

      if (branchError) {
        console.error('Error checking event branches:', branchError);
      }

      // Check raw inscricoes_modalidades data
      const { data: rawData, error: rawError } = await supabase
        .from('inscricoes_modalidades')
        .select(`
          id,
          evento_id,
          atleta_id,
          modalidade_id,
          status
        `)
        .eq('evento_id', eventId);

      console.log('Raw inscricoes_modalidades data:', rawData?.length || 0, 'records found');
      if (rawError) console.error('Error fetching raw data:', rawError);
    }

    // Parse JSON fields that come as strings
    const formattedData = (data || []).map(row => ({
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
