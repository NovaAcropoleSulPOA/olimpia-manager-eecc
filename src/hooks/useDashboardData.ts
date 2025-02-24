
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchBranchAnalytics, fetchAthleteManagement } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { toast } from "sonner";

export function useDashboardData(currentEventId: string | null) {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch branches for filter dropdown
  const branchesQuery = useQuery({
    queryKey: ['branches', currentEventId],
    queryFn: async () => {
      if (!currentEventId) return [];
      const { data, error } = await supabase
        .from('filiais')
        .select('id, nome')
        .order('nome');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentEventId
  });

  // Fetch analytics data
  const analyticsQuery = useQuery({
    queryKey: ['branch-analytics', currentEventId],
    queryFn: () => fetchBranchAnalytics(currentEventId),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    enabled: !!currentEventId
  });

  // Fetch athlete registrations
  const athletesQuery = useQuery({
    queryKey: ['athlete-management', currentEventId],
    queryFn: () => fetchAthleteManagement(false, currentEventId),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    enabled: !!currentEventId
  });

  // Fetch confirmed enrollments
  const enrollmentsQuery = useQuery({
    queryKey: ['confirmed-enrollments', currentEventId],
    queryFn: async () => {
      if (!currentEventId) return [];
      const { data, error } = await supabase
        .from('vw_inscricoes_atletas')
        .select('*')
        .eq('status_inscricao', 'confirmado')
        .eq('evento_id', currentEventId)
        .order('modalidade_nome');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentEventId
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    console.log('Refreshing dashboard data...');
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['branch-analytics', currentEventId] }),
        queryClient.invalidateQueries({ queryKey: ['athlete-management', currentEventId] }),
        analyticsQuery.refetch(),
        athletesQuery.refetch()
      ]);
      console.log('Dashboard data refreshed successfully');
      toast.success("Dados atualizados com sucesso!");
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error("Erro ao atualizar dados");
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    isRefreshing,
    branches: branchesQuery.data,
    branchAnalytics: analyticsQuery.data,
    athletes: athletesQuery.data,
    confirmedEnrollments: enrollmentsQuery.data,
    isLoading: analyticsQuery.isLoading || athletesQuery.isLoading,
    error: analyticsQuery.error || athletesQuery.error,
    handleRefresh
  };
}
