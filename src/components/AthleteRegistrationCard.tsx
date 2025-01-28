import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Building2, Award, CreditCard } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AthleteRegistration } from '@/lib/api';

interface AthleteRegistrationCardProps {
  registration: AthleteRegistration;
  onStatusChange: (id: string, status: 'Pendente' | 'Confirmada' | 'Cancelada' | 'Recusada') => void;
  onPaymentStatusChange: (id: string, status: 'pendente' | 'confirmado' | 'cancelado') => void;
}

export const AthleteRegistrationCard: React.FC<AthleteRegistrationCardProps> = ({
  registration,
  onStatusChange,
  onPaymentStatusChange,
}) => {
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

  const handleWhatsAppClick = (phone: string) => {
    const formattedPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent('Olá! Gostaria de falar sobre sua inscrição nas Olimpíadas.');
    window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className={`cursor-pointer hover:shadow-md transition-shadow ${getStatusColor(registration.status_pagamento)}`}>
          <CardContent className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{registration.nome_atleta}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{registration.email}</span>
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

                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span>{registration.modalidades.length} modalidades</span>
                </div>

                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="capitalize">{registration.status_pagamento}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Detalhes da Inscrição - {registration.nome_atleta}</DialogTitle>
          <DialogDescription>
            Gerencie as modalidades e status da inscrição
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Select
              value={registration.status_inscricao}
              onValueChange={(value: 'Pendente' | 'Confirmada' | 'Cancelada' | 'Recusada') =>
                onStatusChange(registration.id, value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Status da Inscrição" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Confirmada">Confirmada</SelectItem>
                <SelectItem value="Cancelada">Cancelada</SelectItem>
                <SelectItem value="Recusada">Recusada</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={registration.status_pagamento}
              onValueChange={(value: 'pendente' | 'confirmado' | 'cancelado') =>
                onPaymentStatusChange(registration.id, value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Status do Pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="confirmado">Confirmado</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Modalidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data de Inscrição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registration.modalidades.map((modalidade, index) => (
                <TableRow key={index}>
                  <TableCell>{modalidade.modalidade}</TableCell>
                  <TableCell>{modalidade.status}</TableCell>
                  <TableCell>
                    {new Date().toLocaleDateString('pt-BR')}
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