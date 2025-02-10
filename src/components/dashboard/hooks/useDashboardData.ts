
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchBranchAnalytics, fetchAthleteRegistrations } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export const useDashboardData = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: userRole } = useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('papeis_usuarios')
        .select('perfis:perfis (nome)')
        .eq('usuario_id', user.id);
      
      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }
      
      // Find user roles
      const isOrganizer = data?.some(role => role.perfis?.[0]?.nome === 'Organizador');
      const isDelegationRep = data?.some(role => role.perfis?.[0]?.nome === 'Representante de Delegação');
      
      if (isOrganizer) return 'Organizador';
      if (isDelegationRep) return 'Representante de Delegação';
      return null;
    },
    enabled: !!user?.id
  });

  // Get the user's filial_id if they are a Delegation Representative
  const { data: userFilialId } = useQuery({
    queryKey: ['user-filial', user?.id],
    queryFn: async () => {
      if (!user?.id || userRole !== 'Representante de Delegação') return null;
      const { data, error } = await supabase
        .from('usuarios')
        .select('filial_id')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user filial:', error);
        return null;
      }
      
      return data?.filial_id;
    },
    enabled: !!user?.id && userRole === 'Representante de Delegação'
  });

  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('filiais')
        .select('id, nome')
        .order('nome');
      
      if (error) throw error;
      return data || [];
    }
  });

  const { 
    data: branchAnalytics, 
    isLoading: isLoadingAnalytics, 
    error: analyticsError, 
    refetch: refetchAnalytics 
  } = useQuery({
    queryKey: ['branch-analytics', userRole, userFilialId],
    queryFn: async () => {
      let query = supabase.from('vw_analytics_inscricoes').select('*');
      
      // If user is a Delegation Representative, filter by their branch
      if (userRole === 'Representante de Delegação' && userFilialId) {
        query = query.eq('filial_id', userFilialId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!userRole,
  });

  const { 
    data: registrations, 
    isLoading: isLoadingRegistrations, 
    error: registrationsError,
    refetch: refetchRegistrations
  } = useQuery({
    queryKey: ['athlete-registrations', userRole, userFilialId],
    queryFn: async () => {
      let query = supabase.from('vw_inscricoes_atletas').select('*');
      
      // If user is a Delegation Representative, filter by their branch
      if (userRole === 'Representante de Delegação' && userFilialId) {
        query = query.eq('filial_id', userFilialId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!userRole,
  });

  const { data: confirmedEnrollments } = useQuery({
    queryKey: ['confirmed-enrollments', userRole, userFilialId],
    queryFn: async () => {
      let query = supabase
        .from('vw_inscricoes_atletas')
        .select('*')
        .eq('status_inscricao', 'confirmado')
        .order('modalidade_nome');
      
      // If user is a Delegation Representative, filter by their branch
      if (userRole === 'Representante de Delegação' && userFilialId) {
        query = query.eq('filial_id', userFilialId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!userRole,
  });

  const handleRefresh = async () => {
    console.log('Refreshing dashboard data...');
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['branch-analytics'] }),
        queryClient.invalidateQueries({ queryKey: ['athlete-registrations'] }),
        refetchAnalytics(),
        refetchRegistrations()
      ]);
      console.log('Dashboard data refreshed successfully');
      toast.success("Dados atualizados com sucesso!");
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error("Erro ao atualizar dados");
    }
  };

  return {
    branches,
    branchAnalytics,
    registrations,
    confirmedEnrollments,
    isLoadingAnalytics,
    isLoadingRegistrations,
    analyticsError,
    registrationsError,
    handleRefresh,
    userRole
  };
};
