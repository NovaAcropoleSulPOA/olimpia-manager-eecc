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

interface AthleteManagementCardProps {
  athlete: {
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
}

export const AthleteManagementCard: React.FC<AthleteManagementCardProps> = ({
  athlete,
  onStatusChange,
}) => {
  const [justifications, setJustifications] = React.useState<Record<string, string>>({});
  
  // Only allow interaction if payment is confirmed AND athlete is validated
  const isInteractive = athlete.status_pagamento === "confirmado" && athlete.confirmado === true;
  
  // Only show modalities if they exist AND athlete is validated AND payment is confirmed
  const hasValidModalities = athlete.modalidades?.length > 0 && 
                           athlete.confirmado === true && 
                           athlete.status_pagamento === "confirmado";

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
    <Card 
      className={`${getStatusColor(athlete.status_pagamento)} ${
        isInteractive ? 'cursor-pointer hover:shadow-md transition-shadow' : 'cursor-default opacity-75'
      }`}
    >
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold">{athlete.nome_atleta}</h3>
            <div className="flex gap-2">
              <Badge variant={athlete.confirmado ? "default" : "destructive"}>
                {athlete.confirmado ? "Validado" : "Não Validado"}
              </Badge>
              <Badge variant="outline" className={
                athlete.status_pagamento === "confirmado" ? "bg-green-100 text-green-800" :
                athlete.status_pagamento === "pendente" ? "bg-yellow-100 text-yellow-800" :
                "bg-red-100 text-red-800"
              }>
                {athlete.status_pagamento}
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{athlete.email}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <Button
                variant="link"
                className="p-0 h-auto font-normal flex items-center gap-1"
                onClick={(e) => handleWhatsAppClick(e, athlete.telefone)}
              >
                {athlete.telefone}
                <MessageSquare className="h-4 w-4 text-olimpics-green-primary" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>{athlete.filial}</span>
            </div>

            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-muted-foreground" />
              <span>{hasValidModalities ? `${athlete.modalidades.length} modalidades` : 'Sem modalidades'}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!isInteractive) {
    return cardContent;
  }

  return (
    <Dialog>
      <DialogTrigger>{cardContent}</DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Gerenciar Modalidades - {athlete.nome_atleta}</DialogTitle>
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
              {athlete.modalidades?.map((modalidade) => (
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