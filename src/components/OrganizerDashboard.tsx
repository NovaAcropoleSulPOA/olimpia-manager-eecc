import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchBranchAnalytics } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { DashboardMetrics } from "./dashboard/DashboardMetrics";
import { DashboardCharts } from "./dashboard/DashboardCharts";
import { DashboardTable } from "./dashboard/DashboardTable";
import { toast } from "sonner";

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

export default function OrganizerDashboard() {
  const { data: branchAnalytics, isLoading, error, refetch } = useQuery({
    queryKey: ['branch-analytics'],
    queryFn: fetchBranchAnalytics,
  });

  console.log('Branch analytics data:', branchAnalytics);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olimpics-green-primary" />
      </div>
    );
  }

  if (error) {
    console.error('Error fetching branch analytics:', error);
    toast.error('Erro ao carregar dados do dashboard');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-2">Erro ao carregar dados</p>
          <Button variant="outline" onClick={() => refetch()}>
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard do Organizador</h1>
        <Button onClick={() => refetch()}>Atualizar Dados</Button>
      </div>
      
      <DashboardMetrics data={branchAnalytics} />
      <DashboardCharts data={branchAnalytics} />
      <DashboardTable data={branchAnalytics} />
    </div>
  );
}