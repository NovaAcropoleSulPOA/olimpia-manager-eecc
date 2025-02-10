import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DashboardMetrics } from "./dashboard/DashboardMetrics";
import { DashboardCharts } from "./dashboard/DashboardCharts";
import { AthleteRegistrationCard } from "./AthleteRegistrationCard";
import { AthleteFilters } from "./dashboard/AthleteFilters";
import { ModalityEnrollments } from "./dashboard/ModalityEnrollments";
import { toast } from "sonner";
import { LayoutDashboard, Users, ListChecks, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  
  // Filter states
  const [nameFilter, setNameFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");

  // First, fetch the user's filial_id
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('usuarios')
        .select('filial_id')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const { 
    data: branchAnalytics, 
    isLoading: isLoadingAnalytics, 
    error: analyticsError, 
    refetch: refetchAnalytics 
  } = useQuery({
    queryKey: ['branch-analytics', userProfile?.filial_id],
    queryFn: async () => {
      console.log('Fetching branch analytics for filial:', userProfile?.filial_id);
      const { data, error } = await supabase
        .from('vw_analytics_inscricoes')
        .select('*')
        .eq('filial_id', userProfile?.filial_id)
        .single();
      
      if (error) throw error;
      return data ? [data] : [];
    },
    enabled: !!userProfile?.filial_id,
  });

  const { 
    data: registrations, 
    isLoading: isLoadingRegistrations, 
    error: registrationsError,
    refetch: refetchRegistrations
  } = useQuery({
    queryKey: ['athlete-registrations', userProfile?.filial_id],
    queryFn: async () => {
      console.log('Fetching registrations from view for filial:', userProfile?.filial_id);
      const { data, error } = await supabase
        .from('vw_inscricoes_atletas')
        .select('*')
        .eq('filial_id', userProfile?.filial_id);
      
      if (error) {
        console.error('Error fetching registrations:', error);
        throw error;
      }

      if (!data) {
        console.log('No registrations data returned');
        return [];
      }

      // Group registrations by athlete
      const athletesMap = new Map();

      data.forEach(registration => {
        if (!athletesMap.has(registration.atleta_id)) {
          athletesMap.set(registration.atleta_id, {
            id: registration.atleta_id,
            nome_atleta: registration.atleta_nome || registration.nome_atleta || '',
            email: registration.atleta_email || registration.email || '',
            confirmado: registration.status_confirmacao,
            telefone: registration.telefone || '',
            filial: registration.filial_nome || registration.filial || '',
            modalidades: [],
            status_pagamento: registration.status_pagamento || 'pendente',
            tipo_documento: registration.tipo_documento || '',
            numero_documento: registration.numero_documento || '',
            genero: registration.genero || '',
            numero_identificador: registration.numero_identificador || ''
          });
        }

        // Only add modality if it exists
        if (registration.modalidade_nome) {
          const athlete = athletesMap.get(registration.atleta_id);
          athlete.modalidades.push({
            id: registration.inscricao_id?.toString() || '',
            modalidade: registration.modalidade_nome,
            status: registration.status_inscricao || 'pendente',
            justificativa_status: ''
          });
        }
      });

      // Convert Map to array
      const groupedAthletes = Array.from(athletesMap.values());
      console.log('Grouped athletes data:', groupedAthletes);
      return groupedAthletes;
    },
    enabled: !!userProfile?.filial_id,
  });

  const { data: confirmedEnrollments } = useQuery({
    queryKey: ['confirmed-enrollments', userProfile?.filial_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vw_inscricoes_atletas')
        .select('*')
        .eq('filial_id', userProfile?.filial_id)
        .eq('status_inscricao', 'confirmado')
        .order('modalidade_nome');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userProfile?.filial_id
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    console.log('Refreshing delegation dashboard data...');
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['branch-analytics'] }),
        queryClient.invalidateQueries({ queryKey: ['athlete-registrations'] }),
        queryClient.invalidateQueries({ queryKey: ['confirmed-enrollments'] }),
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

  // Filter and sort registrations based on user input
  const filteredRegistrations = registrations?.filter(registration => {
    const nameMatch = registration.nome_atleta?.toLowerCase().includes(nameFilter.toLowerCase()) ?? false;
    const statusMatch = paymentStatusFilter === "all" || registration.status_pagamento === paymentStatusFilter;
    return nameMatch && statusMatch;
  }).sort((a, b) => {
    // Current user's card always appears first
    if (a.id === user?.id) return -1;
    if (b.id === user?.id) return 1;
    // Sort remaining cards alphabetically by name
    return (a.nome_atleta || '').localeCompare(b.nome_atleta || '');
  });

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
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-olimpics-text">Gerenciamento de Atletas</h2>
            
            <AthleteFilters
              nameFilter={nameFilter}
              onNameFilterChange={setNameFilter}
              branchFilter="all"
              onBranchFilterChange={() => {}} // No-op since we don't need branch filter
              paymentStatusFilter={paymentStatusFilter}
              onPaymentStatusFilterChange={setPaymentStatusFilter}
              branches={[]} // Empty array since we don't need branch selection
              hideFilial={true}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRegistrations?.map((registration) => (
                <AthleteRegistrationCard
                  key={registration.id}
                  registration={registration}
                  onStatusChange={async (modalityId, status, justification) => {
                    console.log('Updating modality status:', { modalityId, status, justification });
                    try {
                      const { error } = await supabase
                        .rpc('atualizar_status_inscricao', {
                          inscricao_id: parseInt(modalityId),
                          novo_status: status,
                          justificativa: justification
                        });

                      if (error) throw error;
                      
                      await Promise.all([
                        queryClient.invalidateQueries({ queryKey: ['branch-analytics'] }),
                        queryClient.invalidateQueries({ queryKey: ['athlete-registrations'] })
                      ]);
                      
                      toast.success("Status atualizado com sucesso!");
                    } catch (error) {
                      console.error('Error updating status:', error);
                      toast.error("Erro ao atualizar status");
                      throw error;
                    }
                  }}
                  onPaymentStatusChange={async (athleteId, status) => {
                    console.log('Updating payment status:', { athleteId, status });
                    try {
                      const { error } = await supabase
                        .rpc('atualizar_status_pagamento', {
                          p_atleta_id: athleteId,
                          p_novo_status: status
                        });

                      if (error) throw error;
                      
                      await Promise.all([
                        queryClient.invalidateQueries({ queryKey: ['branch-analytics'] }),
                        queryClient.invalidateQueries({ queryKey: ['athlete-registrations'] })
                      ]);
                      
                      toast.success("Status de pagamento atualizado com sucesso!");
                    } catch (error) {
                      console.error('Error updating payment status:', error);
                      const errorMessage = error instanceof Error ? error.message : "Erro ao atualizar status de pagamento";
                      toast.error(errorMessage);
                      throw error;
                    }
                  }}
                  isCurrentUser={user?.id === registration.id}
                />
              ))}
              
              {filteredRegistrations?.length === 0 && (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  Nenhum atleta encontrado com os filtros selecionados.
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="enrollments" className="mt-6">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-olimpics-text">Inscrições por Modalidade</h2>
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
