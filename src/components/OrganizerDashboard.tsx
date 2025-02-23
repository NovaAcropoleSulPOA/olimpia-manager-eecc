import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchBranchAnalytics, fetchAthleteManagement } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Users, ListChecks } from "lucide-react";
import { EmptyState } from "./dashboard/components/EmptyState";
import { LoadingState } from "./dashboard/components/LoadingState";
import { ErrorState } from "./dashboard/components/ErrorState";
import { DashboardHeader } from "./dashboard/components/DashboardHeader";
import { NoEventSelected } from "./dashboard/components/NoEventSelected";
import { DashboardTab } from "./dashboard/tabs/DashboardTab";
import { AthletesTab } from "./dashboard/tabs/AthletesTab";
import { EnrollmentsTab } from "./dashboard/tabs/EnrollmentsTab";

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
          <DashboardTab branchAnalytics={branchAnalytics} />
        </TabsContent>

        <TabsContent value="athletes" className="mt-6">
          <AthletesTab
            athletes={athletes || []}
            branches={branches || []}
            currentUserId={user?.id}
            currentEventId={currentEventId}
            filters={{
              nameFilter,
              branchFilter,
              paymentStatusFilter
            }}
            onFilterChange={{
              setNameFilter,
              setBranchFilter,
              setPaymentStatusFilter
            }}
          />
        </TabsContent>

        <TabsContent value="enrollments" className="mt-6">
          <EnrollmentsTab enrollments={confirmedEnrollments || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
