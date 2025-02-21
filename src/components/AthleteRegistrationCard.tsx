import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Building2, MessageCircle, FileText, User, Hash } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AthleteManagement } from '@/lib/api';
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { updatePaymentAmount } from '@/lib/api';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

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
  const amountInputRef = React.useRef<HTMLInputElement>(null);
  
  const uniqueModalities = registration?.modalidades?.reduce((acc, current) => {
    if (!acc.has(current.modalidade)) {
      acc.set(current.modalidade, current);
    }
    return acc;
  }, new Map());
  
  const validModalities = Array.from(uniqueModalities?.values() || []).filter(m => m.modalidade);
  const hasModalities = validModalities.length > 0;

  const { data: paymentData, refetch: refetchPayment } = useQuery({
    queryKey: ['payment-amount', registration.id],
    queryFn: async () => {
      if (!registration.id) return null;
      console.log('Fetching payment amount for:', registration.id);
      
      const { data, error } = await supabase
        .from('pagamentos')
        .select('valor')
        .eq('atleta_id', registration.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching payment amount:', error);
        throw error;
      }

      console.log('Payment amount data:', data);
      return data;
    },
    enabled: !!registration.id,
  });

  React.useEffect(() => {
    if (paymentData?.valor && !hasInitialized) {
      setLocalInputAmount(paymentData.valor.toString());
      setHasInitialized(true);
    }
  }, [paymentData, hasInitialized]);

  React.useEffect(() => {
    if (registration?.modalidades) {
      const initialStatuses = registration.modalidades.reduce((acc, modality) => ({
        ...acc,
        [modality.id]: modality.status
      }), {});
      setModalityStatuses(initialStatuses);
    }
  }, [registration?.modalidades]);

  const handleWhatsAppClick = (phone: string) => {
    const formattedPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent('Olá! Gostaria de falar sobre sua inscrição nas Olimpíadas.');
    window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
  };

  const handleStatusChange = async (modalityId: string, newStatus: string) => {
    console.log('Attempting to update modality status:', { modalityId, newStatus });
    
    const justification = justifications[modalityId];
    if (!justification) {
      toast.error('É necessário fornecer uma justificativa para alterar o status.');
      return;
    }
    
    setIsUpdating(prev => ({ ...prev, [modalityId]: true }));
    
    try {
      const currentStatus = modalityStatuses[modalityId];
      setModalityStatuses(prev => ({ ...prev, [modalityId]: newStatus }));
      await onStatusChange(modalityId, newStatus, justification);
      console.log('Modality status update successful');
      setJustifications(prev => ({ ...prev, [modalityId]: '' }));
      toast.success('Status da modalidade atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating modality status:', error);
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
      console.error('Error updating payment status:', error);
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
      console.error('Error updating payment amount:', error);
      toast.error('Erro ao atualizar valor do pagamento');
    } finally {
      setIsUpdatingAmount(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d.]/g, '');
    const parts = value.split('.');
    if (parts.length > 2) return; // Don't allow multiple decimal points
    if (parts[1]?.length > 2) return; // Don't allow more than 2 decimal places
    setLocalInputAmount(value);
  };

  const handleInputBlur = () => {
    if (localInputAmount === '') {
      setLocalInputAmount(paymentData?.valor?.toString() || '0');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmado':
        return 'border-l-4 border-l-green-500 bg-green-50';
      case 'pendente':
        return 'border-l-4 border-l-yellow-500 bg-yellow-50';
      case 'rejeitado':
        return 'border-l-4 border-l-red-500 bg-red-50';
      case 'cancelado':
        return 'border-l-4 border-l-gray-500 bg-gray-50';
      default:
        return 'border-l-4 border-l-gray-500 bg-gray-50';
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmado':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'rejeitado':
      case 'cancelado':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const PaymentStatusSelector = () => (
    <div className="mt-4 flex items-center gap-2">
      <label className="text-sm text-muted-foreground">Status do pagamento:</label>
      <Select onValueChange={handlePaymentStatusChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Alterar status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pendente">Pendente</SelectItem>
          <SelectItem value="confirmado">Confirmado</SelectItem>
          <SelectItem value="cancelado">Cancelado</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  const PaymentAmountField = () => (
    <div className="mt-4 flex items-center gap-2">
      <label className="text-sm text-muted-foreground">Valor do pagamento:</label>
      <Input
        type="text"
        value={localInputAmount}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        className="w-[180px]"
        disabled={registration.status_pagamento !== "pendente" || isUpdatingAmount}
        ref={amountInputRef}
      />
      {registration.status_pagamento === "pendente" && (
        <Button
          variant="outline"
          size="sm"
          onClick={handlePaymentAmountChange}
          disabled={isUpdatingAmount}
        >
          Salvar
        </Button>
      )}
    </div>
  );

  const cardContent = (
    <Card className={cn(
      getStatusColor(registration.status_pagamento),
      isCurrentUser && 'ring-2 ring-olimpics-orange-primary'
    )}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{registration.nome_atleta}</h3>
              {isCurrentUser && (
                <Badge variant="secondary" className="bg-olimpics-orange-primary text-white">
                  Meu Cadastro
                </Badge>
              )}
            </div>
            <Badge className={cn("capitalize", getStatusBadgeStyle(registration.status_pagamento))}>
              {registration.status_pagamento}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    <Button
                      variant="link"
                      className="p-0 h-auto font-normal flex items-center gap-1 text-olimpics-orange-primary hover:text-olimpics-orange-secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWhatsAppClick(registration.telefone);
                      }}
                    >
                      {registration.telefone}
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clique para abrir WhatsApp</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>{registration.filial_nome}</span>
            </div>

            {hasModalities && (
              <div className="col-span-2 flex flex-wrap gap-2 mt-2">
                {validModalities.map((modality, index) => (
                  <Badge 
                    key={`${modality.id}-${index}`}
                    variant="secondary"
                    className={cn(getStatusBadgeStyle(modality.status))}
                  >
                    {modality.modalidade}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <div>{cardContent}</div>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            {registration.nome_atleta}
            {registration.numero_identificador && (
              <Badge 
                variant="outline" 
                className="ml-2 text-lg font-mono bg-olimpics-orange-primary text-white hover:bg-olimpics-orange-secondary"
              >
                <Hash className="h-4 w-4 mr-1" />
                {registration.numero_identificador}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{registration.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  <Button
                    variant="link"
                    className="p-0 h-auto font-normal text-olimpics-orange-primary hover:text-olimpics-orange-secondary"
                    onClick={() => handleWhatsAppClick(registration.telefone)}
                  >
                    {registration.telefone}
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span>{registration.filial_nome}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>{registration.tipo_documento}: {registration.numero_documento}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Gênero: {registration.genero}</span>
                </div>
              </div>
              {onPaymentStatusChange && (
                <>
                  <PaymentStatusSelector />
                  <PaymentAmountField />
                </>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>

        {hasModalities && (
          <ScrollArea className="h-[50vh] w-full rounded-md border p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Modalidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Justificativa</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {validModalities.map((modalidade) => (
                  <TableRow key={modalidade.id}>
                    <TableCell>{modalidade.modalidade}</TableCell>
                    <TableCell>
                      <Badge className={cn("capitalize", getStatusBadgeStyle(modalityStatuses[modalidade.id] || modalidade.status))}>
                        {modalityStatuses[modalidade.id] || modalidade.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="Justificativa para alteração"
                        value={justifications[modalidade.id] || ''}
                        onChange={(e) => setJustifications(prev => ({
                          ...prev,
                          [modalidade.id]: e.target.value
                        }))}
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={modalityStatuses[modalidade.id] || modalidade.status}
                        onValueChange={(value) => handleStatusChange(modalidade.id, value)}
                        disabled={!justifications[modalidade.id] || isUpdating[modalidade.id]}
                      >
                        <SelectTrigger className={cn(
                          "w-[180px]",
                          (!justifications[modalidade.id] || isUpdating[modalidade.id]) && "opacity-50 cursor-not-allowed"
                        )}>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pendente">Pendente</SelectItem>
                          <SelectItem value="confirmado">Confirmado</SelectItem>
                          <SelectItem value="rejeitado">Rejeitado</SelectItem>
                          <SelectItem value="cancelado">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};
