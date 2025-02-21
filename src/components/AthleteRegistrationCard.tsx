
import React from 'react';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AthleteManagement } from '@/lib/api';
import { toast } from "sonner";
import { updatePaymentAmount } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { AthleteDialogContent } from './athlete-card/AthleteDialogContent';
import { AthleteCard } from './athlete-card/components/AthleteCard';
import { useAthleteCardData } from './athlete-card/hooks/useAthleteCardData';

interface AthleteRegistrationCardProps {
  registration: AthleteManagement;
  onStatusChange: (modalityId: string, status: string, justification: string) => Promise<void>;
  onPaymentStatusChange?: (athleteId: string, status: string) => Promise<void>;
  isCurrentUser?: boolean;
}

export const AthleteRegistrationCard: React.FC<AthleteRegistrationCardProps> = ({
  registration,
  onStatusChange,
  onPaymentStatusChange,
  isCurrentUser = false,
}) => {
  const { user } = useAuth();
  const isDelegationView = user?.filial_id === registration.filial_id;
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const {
    justifications,
    setJustifications,
    isUpdating,
    setIsUpdating,
    modalityStatuses,
    setModalityStatuses,
    isUpdatingAmount,
    setIsUpdatingAmount,
    localInputAmount,
    setLocalInputAmount,
    paymentData,
    refetchPayment
  } = useAthleteCardData(registration);

  const handleWhatsAppClick = (phone: string) => {
    const formattedPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent('Olá! Gostaria de falar sobre sua inscrição nas Olimpíadas.');
    window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
  };

  const handleStatusChange = async (modalityId: string, newStatus: string) => {
    const justification = justifications[modalityId];
    if (!justification) {
      toast.error('É necessário fornecer uma justificativa para alterar o status.');
      return;
    }
    
    setIsUpdating(prev => ({ ...prev, [modalityId]: true }));
    
    try {
      setModalityStatuses(prev => ({ ...prev, [modalityId]: newStatus }));
      await onStatusChange(modalityId, newStatus, justification);
      setJustifications(prev => ({ ...prev, [modalityId]: '' }));
      toast.success('Status da modalidade atualizado com sucesso!');
    } catch (error) {
      setModalityStatuses(prev => ({
        ...prev,
        [modalityId]: registration.modalidades.find(m => m.id === modalityId)?.status || prev[modalityId]
      }));
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar status da modalidade';
      toast.error(errorMessage);
    } finally {
      setIsUpdating(prev => ({ ...prev, [modalityId]: false }));
    }
  };

  const handlePaymentStatusChange = async (newStatus: string) => {
    if (!onPaymentStatusChange || !registration?.id) return;
    try {
      await onPaymentStatusChange(registration.id, newStatus);
      toast.success('Status de pagamento atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar status de pagamento');
    }
  };

  const handlePaymentAmountChange = async () => {
    if (!registration?.id || isUpdatingAmount) return;
    
    const newAmount = parseFloat(localInputAmount);
    if (isNaN(newAmount)) {
      toast.error('Por favor, insira um valor válido');
      return;
    }

    setIsUpdatingAmount(true);
    try {
      await updatePaymentAmount(registration.id, newAmount);
      await refetchPayment();
      toast.success('Valor do pagamento atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar valor do pagamento');
    } finally {
      setIsUpdatingAmount(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (paymentData?.isento) return 'border-l-4 border-l-green-500 bg-green-50';

    switch (status.toLowerCase()) {
      case 'confirmado': return 'border-l-4 border-l-green-500 bg-green-50';
      case 'pendente': return 'border-l-4 border-l-yellow-500 bg-yellow-50';
      case 'rejeitado': return 'border-l-4 border-l-red-500 bg-red-50';
      case 'cancelado': return 'border-l-4 border-l-gray-500 bg-gray-50';
      default: return 'border-l-4 border-l-gray-500 bg-gray-50';
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    if (paymentData?.isento) return 'bg-green-100 text-green-800 hover:bg-green-200';

    switch (status.toLowerCase()) {
      case 'confirmado': return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'pendente': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'rejeitado':
      case 'cancelado': return 'bg-red-100 text-red-800 hover:bg-red-200';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <div>
          <AthleteCard
            registration={registration}
            isCurrentUser={isCurrentUser}
            getStatusBadgeStyle={getStatusBadgeStyle}
            getStatusColor={getStatusColor}
            onWhatsAppClick={handleWhatsAppClick}
          />
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <AthleteDialogContent
          nome={registration.nome_atleta}
          numeroIdentificador={registration.numero_identificador}
          isDependent={!!registration.usuario_registrador_id}
          isExempt={!!paymentData?.isento}
          email={registration.email}
          telefone={registration.telefone}
          filialNome={isDelegationView ? undefined : registration.filial_nome}
          tipoDocumento={registration.tipo_documento}
          numeroDocumento={registration.numero_documento}
          genero={registration.genero}
          onWhatsAppClick={handleWhatsAppClick}
          onPaymentStatusChange={onPaymentStatusChange ? handlePaymentStatusChange : undefined}
          paymentControlProps={onPaymentStatusChange ? {
            value: localInputAmount,
            disabled: registration.status_pagamento !== "pendente",
            isUpdating: isUpdatingAmount,
            onInputChange: setLocalInputAmount,
            onSave: handlePaymentAmountChange,
            onBlur: () => {
              if (localInputAmount === '') {
                setLocalInputAmount(paymentData?.valor?.toString() || '0');
              }
            }
          } : undefined}
          modalitiesProps={registration.modalidades.length > 0 ? {
            modalidades: registration.modalidades,
            justifications,
            isUpdating,
            modalityStatuses,
            getStatusBadgeStyle,
            onJustificationChange: (modalityId, value) => 
              setJustifications(prev => ({ ...prev, [modalityId]: value })),
            onStatusChange: handleStatusChange
          } : undefined}
        />
      </DialogContent>
    </Dialog>
  );
};
