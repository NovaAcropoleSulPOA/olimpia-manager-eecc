import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AthleteManagement } from '@/lib/api';
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { updatePaymentAmount } from '@/lib/api';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { AthleteCardHeader } from './athlete-card/AthleteCardHeader';
import { AthleteInfoGrid } from './athlete-card/AthleteInfoGrid';
import { AthleteDialogContent } from './athlete-card/AthleteDialogContent';

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
  const [justifications, setJustifications] = React.useState<Record<string, string>>({});
  const [isUpdating, setIsUpdating] = React.useState<Record<string, boolean>>({});
  const [modalityStatuses, setModalityStatuses] = React.useState<Record<string, string>>({});
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [isUpdatingAmount, setIsUpdatingAmount] = React.useState(false);
  const [localInputAmount, setLocalInputAmount] = React.useState<string>('');
  const [hasInitialized, setHasInitialized] = React.useState(false);

  const { data: paymentData, refetch: refetchPayment } = useQuery({
    queryKey: ['payment-amount', registration.id],
    queryFn: async () => {
      if (!registration.id) return null;
      const { data, error } = await supabase
        .from('pagamentos')
        .select('valor, isento')
        .eq('atleta_id', registration.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!registration.id,
  });

  const { data: registradorInfo } = useQuery({
    queryKey: ['registrador', registration.usuario_registrador_id],
    queryFn: async () => {
      if (!registration.usuario_registrador_id) return null;
      
      const { data, error } = await supabase
        .from('usuarios')
        .select('nome_completo, email')
        .eq('id', registration.usuario_registrador_id)
        .single();

      if (error) return null;
      return data;
    },
    enabled: !!registration.usuario_registrador_id,
  });

  React.useEffect(() => {
    if (paymentData?.valor && !hasInitialized) {
      setLocalInputAmount(paymentData.valor.toString());
      setHasInitialized(true);
    }
  }, [paymentData, hasInitialized]);

  React.useEffect(() => {
    if (registration?.modalidades) {
      const initialStatuses = registration.modalidades.reduce((acc, modality) => {
        const status = paymentData?.isento ? 'confirmado' : modality.status;
        return {
          ...acc,
          [modality.id]: status
        };
      }, {});
      setModalityStatuses(initialStatuses);
    }
  }, [registration?.modalidades, paymentData?.isento]);

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

  const cardContent = (
    <Card className={cn(
      getStatusColor(registration.status_pagamento),
      isCurrentUser && 'ring-2 ring-olimpics-orange-primary'
    )}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <AthleteCardHeader
            nome={registration.nome_atleta}
            isCurrentUser={isCurrentUser}
            hasRegistrador={!!registration.usuario_registrador_id}
            statusPagamento={registration.status_pagamento}
            getStatusBadgeStyle={getStatusBadgeStyle}
            modalidades={registration.modalidades}
          />
          <AthleteInfoGrid
            email={registration.email}
            telefone={registration.telefone}
            filialNome={registration.filial_nome}
            tipoDocumento={registration.tipo_documento}
            numeroDocumento={registration.numero_documento}
            genero={registration.genero}
            onWhatsAppClick={handleWhatsAppClick}
            registradorInfo={registradorInfo}
            hasRegistrador={!!registration.usuario_registrador_id}
          />
        </div>
      </CardContent>
    </Card>
  );

  const validModalities = registration?.modalidades?.filter(m => m.modalidade) || [];

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <div>{cardContent}</div>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <AthleteDialogContent
          nome={registration.nome_atleta}
          numeroIdentificador={registration.numero_identificador}
          isDependent={!!registration.usuario_registrador_id}
          isExempt={!!paymentData?.isento}
          email={registration.email}
          telefone={registration.telefone}
          filialNome={registration.filial_nome}
          tipoDocumento={registration.tipo_documento}
          numeroDocumento={registration.numero_documento}
          genero={registration.genero}
          onWhatsAppClick={handleWhatsAppClick}
          registradorInfo={registradorInfo}
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
          modalitiesProps={validModalities.length > 0 ? {
            modalidades: validModalities,
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
