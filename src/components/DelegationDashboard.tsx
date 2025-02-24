import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DashboardMetrics } from "./dashboard/DashboardMetrics";
import { DashboardCharts } from "./dashboard/DashboardCharts";
import { AthleteRegistrationCard } from "./AthleteRegistrationCard";
import { ModalityEnrollments } from "./dashboard/ModalityEnrollments";
import { toast } from "sonner";
import { LayoutDashboard, Users, ListChecks, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { PaginatedAthleteList } from "./dashboard/PaginatedAthleteList";

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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  
  const currentEventId = localStorage.getItem('currentEventId');
  
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
    queryKey: ['branch-analytics', userProfile?.filial_id, currentEventId],
    queryFn: async () => {
      console.log('Fetching branch analytics for filial:', userProfile?.filial_id, 'and event:', currentEventId);
      const data = await fetchBranchAnalytics(currentEventId, userProfile?.filial_id);
      return data;
    },
    enabled: !!userProfile?.filial_id && !!currentEventId,
  });

  const { 
    data: athletes, 
    isLoading: isLoadingAthletes,
    error: athletesError,
    refetch: refetchAthletes
  } = useQuery({
    queryKey: ['branch-athletes', userProfile?.filial_id, currentEventId],
    queryFn: async () => {
      console.log('Fetching athletes for filial:', userProfile?.filial_id, 'and event:', currentEventId);
      const { data, error } = await supabase
        .from('vw_athletes_management')
        .select('*')
        .eq('filial_id', userProfile?.filial_id)
        .eq('evento_id', currentEventId);
      
      if (error) {
        console.error('Error fetching athletes:', error);
        throw error;
      }

      const athletesMap = new Map();
      
      data?.forEach(record => {
        if (!athletesMap.has(record.atleta_id)) {
          athletesMap.set(record.atleta_id, {
            id: record.atleta_id,
            nome_atleta: record.nome_atleta,
            email: record.email,
            telefone: record.telefone,
            confirmado: record.status_confirmacao,
            filial: record.filial_nome,
            tipo_documento: record.tipo_documento,
            numero_documento: record.numero_documento,
            genero: record.genero,
            numero_identificador: record.numero_identificador,
            status_pagamento: record.status_pagamento || 'pendente',
            modalidades: []
          });
        }

        if (record.modalidade_nome && record.inscricao_id) {
          const athlete = athletesMap.get(record.atleta_id);
          const modalityExists = athlete.modalidades.some(m => m.id === record.inscricao_id.toString());
          
          if (!modalityExists) {
            athlete.modalidades.push({
              id: record.inscricao_id.toString(),
              modalidade: record.modalidade_nome,
              status: record.status_inscricao || 'pendente',
              justificativa_status: record.justificativa_status || ''
            });
          }
        }
      });

      const athletesArray = Array.from(athletesMap.values());
      
      return athletesArray.sort((a, b) => {
        if (a.id === user?.id) return -1;
        if (b.id === user?.id) return 1;
        
        return a.nome_atleta.localeCompare(b.nome_atleta, 'pt-BR', { sensitivity: 'base' });
      });
    },
    enabled: !!userProfile?.filial_id && !!currentEventId,
  });

  const { data: confirmedEnrollments } = useQuery({
    queryKey: ['confirmed-enrollments', userProfile?.filial_id, currentEventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vw_inscricoes_atletas')
        .select('*')
        .eq('filial_id', userProfile?.filial_id)
        .eq('evento_id', currentEventId)
        .eq('status_inscricao', 'confirmado')
        .order('modalidade_nome');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userProfile?.filial_id && !!currentEventId
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    console.log('Refreshing delegation dashboard data...');
    try {
      await Promise.all([
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

  const handleStatusChange = async (modalityId: string, status: string, justification: string) => {
    console.log('Updating modality status:', { modalityId, status, justification });
    try {
      const { error } = await supabase
        .rpc('atualizar_status_inscricao', {
          inscricao_id: parseInt(modalityId),
          novo_status: status,
          justificativa: justification
        });

      if (error) throw error;
      await refetchAthletes();
      toast.success("Status atualizado com sucesso!");
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error("Erro ao atualizar status");
    }
  };

  const handlePaymentStatusChange = async (athleteId: string, status: string) => {
    console.log('Updating payment status:', { athleteId, status });
    try {
      const { error } = await supabase
        .rpc('atualizar_status_pagamento', {
          p_atleta_id: athleteId,
          p_novo_status: status
        });

      if (error) throw error;
      await refetchAthletes();
      toast.success("Status de pagamento atualizado com sucesso!");
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error("Erro ao atualizar status de pagamento");
    }
  };

  if (isLoadingAnalytics || isLoadingAthletes) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olimpics-green-primary" />
      </div>
    );
  }

  if (analyticsError || athletesError) {
    console.error('Error fetching data:', analyticsError || athletesError);
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

  const filteredAthletes = athletes?.filter(athlete => 
    athlete.nome_atleta?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    athlete.numero_identificador?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-bold text-olimpics-text">Gerenciamento de Atletas</h2>
              <div className="flex items-center gap-4">
                <Input
                  type="text"
                  placeholder="Pesquisar por nome ou número identificador..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-md"
                />
              </div>
            </div>

            <PaginatedAthleteList
              athletes={filteredAthletes || []}
              onStatusChange={handleStatusChange}
              onPaymentStatusChange={handlePaymentStatusChange}
              currentUserId={user?.id}
            />
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

async function fetchBranchAnalytics(eventId: string, filialId: string) {
  const { data, error } = await supabase
    .from('vw_analytics_inscricoes')
    .select('*')
    .eq('filial_id', filialId)
    .eq('evento_id', eventId);
  
  if (error) throw error;
  return data || [];
}
