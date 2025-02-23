
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchBranchAnalytics, fetchAthleteManagement } from "@/lib/api";
import { DashboardMetrics } from "./dashboard/DashboardMetrics";
import { DashboardCharts } from "./dashboard/DashboardCharts";
import { AthleteFilters } from "./dashboard/AthleteFilters";
import { ModalityEnrollments } from "./dashboard/ModalityEnrollments";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaginatedAthleteList } from "./dashboard/PaginatedAthleteList";
import { LayoutDashboard, Users, ListChecks } from "lucide-react";
import { EmptyState } from "./dashboard/components/EmptyState";
import { LoadingState } from "./dashboard/components/LoadingState";
import { ErrorState } from "./dashboard/components/ErrorState";
import { DashboardHeader } from "./dashboard/components/DashboardHeader";
import { NoEventSelected } from "./dashboard/components/NoEventSelected";

export default function OrganizerDashboard() {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useAuth();
  const currentEventId = localStorage.getItem('currentEventId');
  
  // Filter states
  const [nameFilter, setNameFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");

  // Fetch branches for filter dropdown
  const { data: branches } = useQuery({
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
  const { 
    data: branchAnalytics, 
    isLoading: isLoadingAnalytics, 
    error: analyticsError, 
    refetch: refetchAnalytics 
  } = useQuery({
    queryKey: ['branch-analytics', currentEventId],
    queryFn: () => fetchBranchAnalytics(currentEventId),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    enabled: !!currentEventId
  });

  // Fetch athlete registrations
  const { 
    data: athletes, 
    isLoading: isLoadingAthletes, 
    error: athletesError,
    refetch: refetchAthletes
  } = useQuery({
    queryKey: ['athlete-management', currentEventId],
    queryFn: () => fetchAthleteManagement(false, currentEventId),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    enabled: !!currentEventId
  });

  // Fetch confirmed enrollments
  const { data: confirmedEnrollments } = useQuery({
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

  if (!currentEventId) {
    return <NoEventSelected />;
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    console.log('Refreshing dashboard data...');
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['branch-analytics', currentEventId] }),
        queryClient.invalidateQueries({ queryKey: ['athlete-management', currentEventId] }),
        refetchAnalytics(),
        refetchAthletes()
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

  if (isLoadingAnalytics || isLoadingAthletes) {
    return <LoadingState />;
  }

  if (analyticsError || athletesError) {
    console.error('Error fetching data:', analyticsError || athletesError);
    toast.error('Erro ao carregar dados do dashboard');
    return <ErrorState onRetry={handleRefresh} />;
  }

  if (!branchAnalytics || branchAnalytics.length === 0) {
    return <EmptyState />;
  }

  // Filter and sort athletes
  const filteredAthletes = athletes?.filter(athlete => {
    const nameMatch = athlete.nome_atleta?.toLowerCase().includes(nameFilter.toLowerCase()) ?? false;
    const branchMatch = branchFilter === "all" || athlete.filial_id === branchFilter;
    const statusMatch = paymentStatusFilter === "all" || athlete.status_pagamento === paymentStatusFilter;
    return nameMatch && branchMatch && statusMatch;
  }).sort((a, b) => {
    if (a.id === user?.id) return -1;
    if (b.id === user?.id) return 1;
    return (a.nome_atleta || '').localeCompare(b.nome_atleta || '', 'pt-BR', { sensitivity: 'base' });
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <DashboardHeader onRefresh={handleRefresh} isRefreshing={isRefreshing} />

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="w-full border-b mb-8 bg-background flex justify-start space-x-2 p-0">
          <TabsTrigger 
            value="dashboard"
            className="flex items-center gap-2 px-6 py-3 text-base font-medium data-[state=active]:border-b-2 data-[state=active]:border-olimpics-green-primary rounded-none"
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboards
          </TabsTrigger>
          <TabsTrigger 
            value="athletes"
            className="flex items-center gap-2 px-6 py-3 text-base font-medium data-[state=active]:border-b-2 data-[state=active]:border-olimpics-green-primary rounded-none"
          >
            <Users className="h-5 w-5" />
            Gerenciar Atletas
          </TabsTrigger>
          <TabsTrigger 
            value="enrollments"
            className="flex items-center gap-2 px-6 py-3 text-base font-medium data-[state=active]:border-b-2 data-[state=active]:border-olimpics-green-primary rounded-none"
          >
            <ListChecks className="h-5 w-5" />
            Inscrições por Modalidade
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <div className="grid gap-6">
            <DashboardMetrics data={branchAnalytics} />
            <DashboardCharts data={branchAnalytics} />
          </div>
        </TabsContent>

        <TabsContent value="athletes" className="mt-6">
          <div className="mt-4">
            <h2 className="text-2xl font-bold mb-4 text-olimpics-text">Gerenciamento de Atletas</h2>
            
            <AthleteFilters
              nameFilter={nameFilter}
              onNameFilterChange={setNameFilter}
              branchFilter={branchFilter}
              onBranchFilterChange={setBranchFilter}
              paymentStatusFilter={paymentStatusFilter}
              onPaymentStatusFilterChange={setPaymentStatusFilter}
              branches={branches || []}
            />

            <div className="mt-4">
              <PaginatedAthleteList
                athletes={filteredAthletes || []}
                onStatusChange={async (modalityId, status, justification) => {
                  try {
                    await updateModalityStatus(modalityId, status, justification);
                    toast.success("Status atualizado com sucesso!");
                    await queryClient.invalidateQueries({ 
                      queryKey: ['branch-analytics', currentEventId]
                    });
                    await queryClient.invalidateQueries({ 
                      queryKey: ['athlete-management', currentEventId]
                    });
                  } catch (error) {
                    console.error('Error updating status:', error);
                    toast.error("Erro ao atualizar status");
                  }
                }}
                onPaymentStatusChange={async (athleteId, status) => {
                  try {
                    await updatePaymentStatus(athleteId, status);
                    toast.success("Status de pagamento atualizado com sucesso!");
                    await queryClient.invalidateQueries({ 
                      queryKey: ['branch-analytics', currentEventId]
                    });
                    await queryClient.invalidateQueries({ 
                      queryKey: ['athlete-management', currentEventId]
                    });
                  } catch (error) {
                    console.error('Error updating payment status:', error);
                    toast.error("Erro ao atualizar status de pagamento");
                  }
                }}
                currentUserId={user?.id}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="enrollments" className="mt-6">
          <div className="mt-4">
            <h2 className="text-2xl font-bold mb-4 text-olimpics-text">Inscrições por Modalidade</h2>
            {confirmedEnrollments && confirmedEnrollments.length > 0 ? (
              <ModalityEnrollments enrollments={confirmedEnrollments} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma inscrição confirmada encontrada.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
