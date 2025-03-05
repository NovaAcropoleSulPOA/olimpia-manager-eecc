
import { useQuery } from '@tanstack/react-query';
import { fetchBranchAnalytics } from '@/lib/api';
import { supabase } from '@/lib/supabase';

export const useAnalyticsData = (eventId: string | null, filterByBranch: boolean = false) => {
  const { 
    data: branchAnalytics,
    isLoading,
    error,
    refetch 
  } = useQuery({
    queryKey: ['branch-analytics', eventId, filterByBranch],
    queryFn: async () => {
      try {
        console.log('Fetching branch analytics with eventId:', eventId, 'filterByBranch:', filterByBranch);
        
        if (!eventId) {
          console.warn('Event ID is required for analytics query');
          return [];
        }
        
        // Only get user's filial_id if we need to filter by branch
        let filialId;
        if (filterByBranch) {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user?.id) {
            console.warn('User ID not available for filtering branch analytics');
            return [];
          }
          
          const { data: userProfile, error: userError } = await supabase
            .from('usuarios')
            .select('filial_id')
            .eq('id', user.id)
            .single();
            
          if (userError) {
            console.error('Error fetching user profile for branch filtering:', userError);
          } else {
            filialId = userProfile?.filial_id;
            console.log('User filial_id for analytics filtering:', filialId);
          }
        }
        
        // Now fetch the analytics with the appropriate filter
        const result = await fetchBranchAnalytics(eventId, filterByBranch ? filialId : undefined);
        console.log('Branch analytics result:', result);
        return result;
      } catch (error) {
        console.error('Error in branch analytics query:', error);
        throw error; // Let the error propagate to show error state
      }
    },
    enabled: !!eventId,
    retry: 1,
    meta: {
      onError: (error: any) => {
        console.error('Error fetching branch analytics:', error);
      }
    }
  });

  return {
    branchAnalytics,
    isLoading,
    error,
    refetch
  };
};
