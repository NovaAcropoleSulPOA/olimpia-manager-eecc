
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

  // Get the current user for branch filtering
  const { 
    data: athletes, 
    isLoading: isLoadingAthletes,
    error: athletesError,
    refetch: refetchAthletes
  } = useQuery({
    queryKey: ['athlete-management', eventId, filterByBranch],
    queryFn: () => fetchAthleteManagement(filterByBranch, eventId),
    enabled: !!eventId,
    retry: 1,
    meta: {
      onError: (error: any) => {
        console.error('Error fetching athletes:', error);
      }
    }
  });

  // Get branch data for filtering and display
  const { 
    data: branches,
    isLoading: isLoadingBranches,
    error: branchesError,
  } = useQuery({
    queryKey: ['branches'],
    queryFn: fetchBranches,
    retry: 1,
    meta: {
      onError: (error: any) => {
        console.error('Error fetching branches:', error);
      }
    }
  });

  // The analytics query needs to get the current user's filial_id if we're filtering by branch
  const { 
    data: branchAnalytics,
    isLoading: isLoadingAnalytics,
    error: analyticsError,
    refetch: refetchAnalytics 
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

  // Updated enrollment query to properly filter by user's branch
  const {
    data: confirmedEnrollments,
    isLoading: isLoadingEnrollments,
    error: enrollmentsError,
    refetch: refetchEnrollments
  } = useQuery({
    queryKey: ['confirmed-enrollments', eventId, filterByBranch],
    queryFn: async () => {
      if (!eventId) return [];

      try {
        // First get the user's filial_id if we're in delegation mode
        let userFilialId: string | undefined;
        
        if (filterByBranch) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: userProfile } = await supabase
              .from('usuarios')
              .select('filial_id')
              .eq('id', user.id)
              .single();
              
            userFilialId = userProfile?.filial_id;
            console.log('Filtering enrollments by filial_id:', userFilialId);
            
            if (!userFilialId) {
              console.warn('User has no branch assigned, returning empty enrollments list');
              return [];
            }
          } else {
            console.warn('No authenticated user found for branch filtering, returning empty enrollments list');
            return [];
          }
        }

        // Check if the view exists
        const { error: viewCheckError } = await supabase
          .from('information_schema.views')
          .select('table_name')
          .eq('table_name', 'vw_inscricoes_com_confirmacao')
          .single();

        if (viewCheckError) {
          console.warn('View vw_inscricoes_com_confirmacao does not exist, using alternative data source');
          
          // Alternative approach: Get basic enrollment data from inscricoes_modalidades
          let query = supabase
            .from('inscricoes_modalidades')
            .select(`
              id,
              atleta_id,
              modalidade_id,
              status,
              modalidades(nome),
              usuarios!atleta_id(nome_completo, tipo_documento, numero_documento, telefone, email, filial_id, id)
            `)
            .eq('evento_id', eventId)
            .eq('status', 'confirmado');

          // For delegation representatives, only show their branch
          if (filterByBranch && userFilialId) {
            query = query.eq('usuarios.filial_id', userFilialId);
          }

          const { data, error } = await query;

          if (error) throw error;
          
          // Get all filial names to use in the transformation
          const { data: filiais } = await supabase
            .from('filiais')
            .select('id, nome');
          
          const filiaisMap = new Map();
          if (filiais) {
            filiais.forEach((filial: any) => {
              filiaisMap.set(filial.id, filial.nome);
            });
          }
          
          // Filter out records where usuarios is null
          const validData = (data || []).filter(item => item.usuarios !== null);
          
          // Transform to match EnrolledUser interface
          const transformedData: EnrolledUser[] = validData.map((item: any) => ({
            id: item.id,
            atleta_id: item.atleta_id,
            nome_atleta: item.usuarios?.nome_completo || 'Unknown',
            tipo_documento: item.usuarios?.tipo_documento || 'Unknown',
            numero_documento: item.usuarios?.numero_documento || 'Unknown',
            telefone: item.usuarios?.telefone || 'Unknown',
            email: item.usuarios?.email || 'Unknown',
            modalidade_id: item.modalidade_id,
            modalidade_nome: item.modalidades?.nome || 'Unknown',
            status_inscricao: item.status,
            filial_id: item.usuarios?.filial_id || '',
            filial: filiaisMap.get(item.usuarios?.filial_id) || 'Unknown',
            evento_id: eventId
          }));

          console.log(`Found ${transformedData.length} confirmed enrollments after filtering`);
          return transformedData;
        }

        // If view exists, use the original query
        let query = supabase
          .from('vw_inscricoes_com_confirmacao')
          .select('*')
          .eq('evento_id', eventId)
          .eq('status_inscricao', 'confirmado');

        // For delegation representatives, only show their branch
        if (filterByBranch && userFilialId) {
          query = query.eq('filial_id', userFilialId);
        }

        const { data, error } = await query;

        if (error) throw error;
        console.log(`Found ${data?.length || 0} enrollments using view`);
        return data as EnrolledUser[];
      } catch (error) {
        console.error('Error fetching enrollments:', error);
        return []; // Return empty array to prevent UI breakage
      }
    },
    enabled: !!eventId,
    retry: 1,
    meta: {
      onError: (error: any) => {
        console.error('Error fetching enrollments:', error);
      }
    }
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
    athletes: athletes || [],
    branches: branches || [],
    branchAnalytics: branchAnalytics || [],
    confirmedEnrollments: confirmedEnrollments || [],
    isLoading: {
      athletes: isLoadingAthletes,
      branches: isLoadingBranches,
      analytics: isLoadingAnalytics,
      enrollments: isLoadingEnrollments,
      any: isLoadingAthletes || isLoadingBranches || isLoadingAnalytics || isLoadingEnrollments
    },
    error: {
      athletes: athletesError,
      branches: branchesError, 
      analytics: analyticsError,
      enrollments: enrollmentsError,
      any: athletesError || branchesError || analyticsError || enrollmentsError
    },
    isRefreshing,
    handleRefresh
  };
};
