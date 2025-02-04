import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Building2, Award, MessageSquare } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface AthleteModality {
  id: string;
  modalidade: string;
  status: string;
  justificativa_status: string;
}

interface AthleteRegistrationCardProps {
  registration: {
    id: string;
    nome_atleta: string;
    email: string;
    telefone: string;
    filial: string;
    status_pagamento: string;
    modalidades: AthleteModality[];
    confirmado?: boolean;
  };
  onStatusChange: (modalityId: string, status: string, justification: string) => Promise<void>;
  onPaymentStatusChange?: (athleteId: string, status: string) => Promise<void>;
}

export const AthleteRegistrationCard: React.FC<AthleteRegistrationCardProps> = ({
  registration,
  onStatusChange,
  onPaymentStatusChange,
}) => {
  const [justifications, setJustifications] = React.useState<Record<string, string>>({});
  
  const hasValidModalities = registration.modalidades?.length > 0;

  const handleWhatsAppClick = (e: React.MouseEvent, phone: string) => {
    e.stopPropagation();
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
    
    try {
      await onStatusChange(modalityId, newStatus, justification);
      toast.success('Status atualizado com sucesso!');
      setJustifications(prev => ({ ...prev, [modalityId]: '' }));
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erro ao atualizar status');
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
    switch (status) {
      case 'confirmado':
        return 'border-l-4 border-l-green-500 bg-green-50';
      case 'pendente':
        return 'border-l-4 border-l-yellow-500 bg-yellow-50';
      case 'cancelado':
        return 'border-l-4 border-l-red-500 bg-red-50';
      default:
        return 'border-l-4 border-l-gray-500 bg-gray-50';
    }
  };

  const cardContent = (
    <Card className={`${getStatusColor(registration.status_pagamento)} cursor-pointer hover:shadow-md transition-shadow`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold">{registration.nome_atleta}</h3>
            <Badge variant="outline" className={
              registration.status_pagamento === "confirmado" ? "bg-green-100 text-green-800" :
              registration.status_pagamento === "pendente" ? "bg-yellow-100 text-yellow-800" :
              "bg-red-100 text-red-800"
            }>
              {registration.status_pagamento}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{registration.email}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <Button
                variant="link"
                className="p-0 h-auto font-normal flex items-center gap-1"
                onClick={(e) => handleWhatsAppClick(e, registration.telefone)}
              >
                {registration.telefone}
                <MessageSquare className="h-4 w-4 text-olimpics-green-primary" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>{registration.filial}</span>
            </div>

            {hasValidModalities && (
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-muted-foreground" />
                <span>{registration.modalidades.length} modalidades</span>
              </div>
            )}
          </div>

          {onPaymentStatusChange && (
            <div className="mt-4 flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Status do pagamento:</label>
              <Select onValueChange={handlePaymentStatusChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Alterar status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmado">Confirmado</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div>{cardContent}</div>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Gerenciar Modalidades - {registration.nome_atleta}</DialogTitle>
          <DialogDescription>
            Gerencie as modalidades e status do atleta
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
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
              {registration.modalidades?.map((modalidade) => (
                <TableRow key={modalidade.id}>
                  <TableCell>{modalidade.modalidade}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      modalidade.status === "confirmado" ? "bg-green-100 text-green-800" :
                      modalidade.status === "pendente" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }>
                      {modalidade.status}
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
                      onValueChange={(value) => handleStatusChange(modalidade.id, value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="confirmado">Confirmada</SelectItem>
                        <SelectItem value="cancelado">Cancelada</SelectItem>
                        <SelectItem value="recusado">Recusada</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};