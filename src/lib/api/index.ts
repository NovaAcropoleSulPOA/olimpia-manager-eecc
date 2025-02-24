
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

export const fetchBranchAnalytics = async (eventId: string | null, filialId?: string) => {
  if (!eventId) return [];
  
  try {
    // Set the current event ID in the session
    const { error: configError } = await supabase.rpc('set_config', {
      parameter: 'app.current_event_id',
      value: eventId
    });

    if (configError) {
      console.error('Error setting event ID in session:', configError);
      // Continue anyway, the view will handle NULL case
    }
    
    let query = supabase
      .from('vw_analytics_inscricoes')
      .select('*');
    
    // Apply filial filter only if provided (for delegation view)
    if (filialId) {
      query = query.eq('filial_id', filialId);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.warn('No analytics data found for event:', eventId);
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchBranchAnalytics:', error);
    throw error;
  }
};
