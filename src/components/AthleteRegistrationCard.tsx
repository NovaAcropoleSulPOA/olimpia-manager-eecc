import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Building2, Award, CheckCircle2, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AthleteRegistration } from '@/lib/api';
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface AthleteRegistrationCardProps {
  registration: AthleteRegistration;
  onStatusChange: (modalityId: string, status: string, justification: string) => Promise<void>;
}

export const AthleteRegistrationCard: React.FC<AthleteRegistrationCardProps> = ({
  registration,
  onStatusChange,
}) => {
  const [justifications, setJustifications] = React.useState<Record<string, string>>({});
  const hasModalities = registration.modalidades && registration.modalidades.length > 0;

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
    
    try {
      await onStatusChange(modalityId, newStatus, justification);
      toast.success('Status atualizado com sucesso!');
      setJustifications(prev => ({ ...prev, [modalityId]: '' }));
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erro ao atualizar status');
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

  const CardContentComponent = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold">{registration.nome_atleta}</h3>
        <div className="flex gap-2">
          <Badge variant={registration.confirmado ? "default" : "destructive"}>
            {registration.confirmado ? (
              <div className="flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Validado
              </div>
            ) : (
              <div className="flex items-center">
                <XCircle className="w-4 h-4 mr-1" />
                Não Validado
              </div>
            )}
          </Badge>
          <Badge className={cn("capitalize", getStatusTextColor(registration.status_pagamento))}>
            {registration.status_pagamento}
          </Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="truncate">
            {registration.email?.trim() ? registration.email : "Email não informado"}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <Button
            variant="link"
            className="p-0 h-auto font-normal"
            onClick={(e) => {
              e.stopPropagation();
              handleWhatsAppClick(registration.telefone);
            }}
          >
            {registration.telefone}
          </Button>
        </div>

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
    </div>
  );

  // If the athlete has no modalities, render a non-clickable card
  if (!hasModalities) {
    return (
      <Card className={cn(getStatusColor(registration.status_pagamento))}>
        <CardContent className="p-6">
          <CardContentComponent />
        </CardContent>
      </Card>
    );
  }

  // If the athlete has modalities, render a clickable card with dialog
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className={cn("cursor-pointer hover:shadow-md transition-shadow", getStatusColor(registration.status_pagamento))}>
          <CardContent className="p-6">
            <CardContentComponent />
          </CardContent>
        </Card>
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
              {registration.modalidades.map((modalidade) => (
                <TableRow key={modalidade.id}>
                  <TableCell>{modalidade.modalidade}</TableCell>
                  <TableCell>
                    <Badge className={cn("capitalize", getStatusTextColor(modalidade.status))}>
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
                      value={modalidade.status}
                      onValueChange={(value) => handleStatusChange(modalidade.id, value)}
                      disabled={!justifications[modalidade.id]}
                    >
                      <SelectTrigger className={cn(
                        "w-[180px]",
                        !justifications[modalidade.id] && "opacity-50 cursor-not-allowed"
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
        </div>
      </DialogContent>
    </Dialog>
  );
};