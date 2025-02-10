
import { useState } from "react";
import { AthleteRegistrationCard } from "../../AthleteRegistrationCard";
import { AthleteFilters } from "../AthleteFilters";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { updateModalityStatus, updatePaymentStatus } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

interface AthleteManagementTabProps {
  registrations: any[];
  branches: any[];
}

export const AthleteManagementTab = ({ registrations, branches }: AthleteManagementTabProps) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [nameFilter, setNameFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");

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

  const filteredRegistrations = registrations
    ?.filter(registration => {
      const nameMatch = registration.nome_atleta?.toLowerCase().includes(nameFilter.toLowerCase()) ?? false;
      const branchMatch = branchFilter === "all" || registration.filial_id === branchFilter;
      const statusMatch = paymentStatusFilter === "all" || registration.status_pagamento === paymentStatusFilter;
      return nameMatch && branchMatch && statusMatch;
    })
    .sort((a, b) => {
      if (a.id === user?.id) return -1;
      if (b.id === user?.id) return 1;
      return (a.nome_atleta || '').localeCompare(b.nome_atleta || '');
    });

  return (
    <div className="mt-4">
      <h2 className="text-2xl font-bold mb-4 text-olimpics-text">Gerenciamento de Atletas</h2>
      
      <AthleteFilters
        nameFilter={nameFilter}
        onNameFilterChange={setNameFilter}
        branchFilter={branchFilter}
        onBranchFilterChange={setBranchFilter}
        paymentStatusFilter={paymentStatusFilter}
        onPaymentStatusFilterChange={setPaymentStatusFilter}
        branches={branches}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {filteredRegistrations?.map((registration) => (
          <AthleteRegistrationCard
            key={registration.id}
            registration={registration}
            onStatusChange={handleStatusChange}
            onPaymentStatusChange={handlePaymentStatusChange}
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
  );
};
