
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  fetchAthleteManagement, 
  fetchBranchAnalytics,
  fetchBranches
} from '@/lib/api';
import { EnrolledUser } from '@/components/dashboard/types/enrollmentTypes';
import { supabase } from '@/lib/supabase';

export const useDashboardData = (eventId: string | null, filterByBranch: boolean = false) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { 
    data: athletes, 
    isLoading: isLoadingAthletes,
    error: athletesError,
    refetch: refetchAthletes
  } = useQuery({
    queryKey: ['athlete-management', eventId, filterByBranch],
    queryFn: () => fetchAthleteManagement(filterByBranch, eventId),
    enabled: !!eventId,
  });

  const { 
    data: branches,
    isLoading: isLoadingBranches,
  } = useQuery({
    queryKey: ['branches'],
    queryFn: fetchBranches,
  });

  const { 
    data: branchAnalytics,
    isLoading: isLoadingAnalytics,
    error: analyticsError,
    refetch: refetchAnalytics 
  } = useQuery({
    queryKey: ['branch-analytics', eventId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return fetchBranchAnalytics(eventId, filterByBranch ? user?.id : undefined);
    },
    enabled: !!eventId,
  });

  const {
    data: confirmedEnrollments,
    isLoading: isLoadingEnrollments,
    error: enrollmentsError,
    refetch: refetchEnrollments
  } = useQuery({
    queryKey: ['confirmed-enrollments', eventId],
    queryFn: async () => {
      if (!eventId) return [];

      // Apply filterByBranch parameter based on user role
      let query = supabase
        .from('vw_inscricoes_com_confirmacao')
        .select('*')
        .eq('evento_id', eventId)
        .eq('status_inscricao', 'confirmado');

      // For delegation representatives, only show their branch
      if (filterByBranch) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: userProfile } = await supabase
            .from('usuarios')
            .select('filial_id')
            .eq('id', user.id)
            .single();

          if (userProfile?.filial_id) {
            query = query.eq('filial_id', userProfile.filial_id);
          }
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as EnrolledUser[];
    },
    enabled: !!eventId,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchAthletes(),
        refetchAnalytics(),
        refetchEnrollments()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    athletes,
    branches,
    branchAnalytics,
    confirmedEnrollments,
    isLoading: isLoadingAthletes || isLoadingBranches || isLoadingAnalytics || isLoadingEnrollments,
    error: athletesError || analyticsError || enrollmentsError,
    isRefreshing,
    handleRefresh
  };
};
