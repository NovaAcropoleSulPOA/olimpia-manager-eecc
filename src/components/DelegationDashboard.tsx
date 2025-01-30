import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchBranchAnalytics, fetchAthleteRegistrations, updateModalityStatus, updatePaymentStatus } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { DashboardMetrics } from "./dashboard/DashboardMetrics";
import { DashboardCharts } from "./dashboard/DashboardCharts";
import { AthleteRegistrationCard } from "./AthleteRegistrationCard";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-96 text-center">
    <p className="text-muted-foreground mb-2">Nenhum dado disponível no momento</p>
    <p className="text-sm text-muted-foreground mb-4">
      Verifique se existem inscrições registradas no sistema
    </p>
    <Button
      variant="outline"
      onClick={() => {
        window.location.reload();
      }}
    >
      Atualizar Dados
    </Button>
  </div>
);

export default function DelegationDashboard() {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useAuth();

  const { 
    data: branchAnalytics, 
    isLoading: isLoadingAnalytics, 
    error: analyticsError, 
    refetch: refetchAnalytics 
  } = useQuery({
    queryKey: ['branch-analytics', user?.filial_id],
    queryFn: fetchBranchAnalytics,
    select: (data) => {
      if (!user?.filial_id) return [];
      const filteredData = data.filter(branch => branch.filial_id === user.filial_id);
      console.log('Filtered branch analytics:', filteredData);
      return filteredData;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });

  const { 
    data: registrations, 
    isLoading: isLoadingRegistrations, 
    error: registrationsError,
    refetch: refetchRegistrations
  } = useQuery({
    queryKey: ['athlete-registrations', user?.filial_id],
    queryFn: fetchAthleteRegistrations,
    select: (data) => {
      if (!user?.filial_id) return [];
      
      // Filter athletes from the same filial, including the logged-in user
      const filteredRegistrations = data.filter(reg => {
        const isFromSameFilial = reg.filial === user.filial_id;
        console.log(`Registration ${reg.id}:`, {
          isFromSameFilial,
          regFilial: reg.filial,
          userFilialId: user.filial_id,
          isCurrentUser: reg.id === user.id
        });
        return isFromSameFilial;
      });
      
      console.log('All registrations:', data);
      console.log('Filtered registrations:', filteredRegistrations);
      return filteredRegistrations;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (!user?.filial_id) return;

    console.log('Setting up real-time subscription for filial:', user.filial_id);
    
    const channel = supabase
      .channel('athlete-registrations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vw_inscricoes_atletas',
          filter: `filial_id=eq.${user.filial_id}`
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          // Invalidate and refetch queries
          queryClient.invalidateQueries({ queryKey: ['athlete-registrations'] });
          queryClient.invalidateQueries({ queryKey: ['branch-analytics'] });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [user?.filial_id, queryClient]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
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
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleStatusChange = async (modalityId: string, status: string, justification: string) => {
    console.log('Attempting to update modality status:', { modalityId, status, justification });
    try {
      await updateModalityStatus(modalityId, status, justification);
      console.log('Status updated successfully in the database');
      toast.success("Status atualizado com sucesso!");
      
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['branch-analytics'] }),
        queryClient.invalidateQueries({ queryKey: ['athlete-registrations'] })
      ]);
      console.log('Queries invalidated and refetched');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error("Erro ao atualizar status. Por favor, tente novamente.");
      throw error;
    }
  };

  const handlePaymentStatusChange = async (athleteId: string, status: string) => {
    console.log('Attempting to update payment status:', { athleteId, status });
    try {
      await updatePaymentStatus(athleteId, status);
      console.log('Payment status updated successfully in the database');
      toast.success("Status de pagamento atualizado com sucesso!");
      
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['branch-analytics'] }),
        queryClient.invalidateQueries({ queryKey: ['athlete-registrations'] })
      ]);
      console.log('Queries invalidated and refetched after payment status update');
    } catch (error) {
      console.error('Error updating payment status:', error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao atualizar status de pagamento";
      toast.error(errorMessage);
      throw error;
    }
  };

  if (isLoadingAnalytics || isLoadingRegistrations) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olimpics-green-primary" />
      </div>
    );
  }

  if (analyticsError || registrationsError) {
    console.error('Error fetching data:', analyticsError || registrationsError);
    toast.error('Erro ao carregar dados do dashboard');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-2">Erro ao carregar dados</p>
          <Button variant="outline" onClick={handleRefresh}>
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!branchAnalytics || branchAnalytics.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-olimpics-text">Dashboard da Delegação</h1>
        <Button 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary text-white"
        >
          {isRefreshing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Atualizando...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar Dados
            </>
          )}
        </Button>
      </div>
      
      <div className="grid gap-6">
        <DashboardMetrics data={branchAnalytics} />
        <DashboardCharts data={branchAnalytics} />
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4 text-olimpics-text">Gerenciamento de Atletas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {registrations?.map((registration) => (
            <AthleteRegistrationCard
              key={registration.id}
              registration={registration}
              onStatusChange={handleStatusChange}
              onPaymentStatusChange={handlePaymentStatusChange}
              isCurrentUser={registration.id === user?.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
