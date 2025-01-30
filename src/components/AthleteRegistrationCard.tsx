import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Building2, Award, MessageCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AthleteRegistration } from '@/lib/api';
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AthleteRegistrationCardProps {
  registration: AthleteRegistration;
  onStatusChange: (modalityId: string, status: string, justification: string) => Promise<void>;
  onPaymentStatusChange?: (athleteId: string, status: string) => Promise<void>;
}

export const AthleteRegistrationCard: React.FC<AthleteRegistrationCardProps> = ({
  registration,
  onStatusChange,
  onPaymentStatusChange,
}) => {
  const [justifications, setJustifications] = React.useState<Record<string, string>>({});
  const [isUpdating, setIsUpdating] = React.useState<Record<string, boolean>>({});
  const [modalityStatuses, setModalityStatuses] = React.useState<Record<string, string>>({});
  const [dialogOpen, setDialogOpen] = React.useState(false);
  
  const isPaymentPending = registration.status_pagamento === "pendente";
  const hasModalities = registration.modalidades.length > 0;

  // Initialize modality statuses on mount
  React.useEffect(() => {
    const initialStatuses = registration.modalidades.reduce((acc, modality) => ({
      ...acc,
      [modality.id]: modality.status
    }), {});
    setModalityStatuses(initialStatuses);
  }, [registration.modalidades]);

  const handleWhatsAppClick = (phone: string) => {
    const formattedPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent('Olá! Gostaria de falar sobre sua inscrição nas Olimpíadas.');
    window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
  };

  const handleStatusChange = async (modalityId: string, newStatus: string) => {
    console.log('Attempting to update status:', { modalityId, newStatus });
    const justification = justifications[modalityId];
    if (!justification) {
      toast.error('É necessário fornecer uma justificativa para alterar o status.');
      return;
    }
    
    setIsUpdating(prev => ({ ...prev, [modalityId]: true }));
    
    try {
      await onStatusChange(modalityId, newStatus, justification);
      
      // Update local state
      setModalityStatuses(prev => ({ ...prev, [modalityId]: newStatus }));
      setJustifications(prev => ({ ...prev, [modalityId]: '' }));
      
      toast.success('Status atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erro ao atualizar status. Por favor, tente novamente.');
    } finally {
      setIsUpdating(prev => ({ ...prev, [modalityId]: false }));
    }
  };

  const handlePaymentStatusChange = async (newStatus: string) => {
    if (!onPaymentStatusChange) return;
    
    try {
      await onPaymentStatusChange(registration.id, newStatus);
      toast.success('Status de pagamento atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Erro ao atualizar status de pagamento');
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

  const getStatusTextColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmado':
        return 'text-green-700 bg-green-100';
      case 'pendente':
        return 'text-yellow-700 bg-yellow-100';
      case 'rejeitado':
        return 'text-red-700 bg-red-100';
      case 'cancelado':
        return 'text-gray-700 bg-gray-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const cardContent = (
    <Card className={cn(
      getStatusColor(registration.status_pagamento),
      isPaymentPending ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer hover:shadow-md transition-shadow'
    )}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold">{registration.nome_atleta}</h3>
            <Badge className={cn("capitalize", getStatusTextColor(registration.status_pagamento))}>
              {registration.status_pagamento}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">
                {registration.email?.trim() ? registration.email : "Email não informado"}
              </span>
            </div>
            
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
              <span>{registration.filial}</span>
            </div>

            {hasModalities && (
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-muted-foreground" />
                <span>{registration.modalidades.length} modalidades</span>
              </div>
            )}
          </div>

          {registration.status_pagamento === "pendente" && onPaymentStatusChange && (
            <div className="mt-4 flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Status do pagamento:</label>
              <Select onValueChange={handlePaymentStatusChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Alterar status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmado">Confirmado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (isPaymentPending) {
    return cardContent;
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <div>{cardContent}</div>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Gerenciar Modalidades</DialogTitle>
          <DialogDescription className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <h4 className="font-semibold text-lg">{registration.nome_atleta}</h4>
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
                  <span>{registration.filial}</span>
                </div>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

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
              {registration.modalidades.map((modalidade) => (
                <TableRow key={modalidade.id}>
                  <TableCell>{modalidade.modalidade}</TableCell>
                  <TableCell>
                    <Badge className={cn("capitalize", getStatusTextColor(modalityStatuses[modalidade.id] || modalidade.status))}>
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
                        <SelectItem value="pendente">pendente</SelectItem>
                        <SelectItem value="confirmado">confirmado</SelectItem>
                        <SelectItem value="rejeitado">rejeitado</SelectItem>
                        <SelectItem value="cancelado">cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};