
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AthleteManagement } from '@/lib/api';
import { AthleteCardHeader } from '../AthleteCardHeader';
import { AthleteInfoGrid } from '../AthleteInfoGrid';

interface AthleteCardProps {
  registration: AthleteManagement;
  isCurrentUser: boolean;
  registradorInfo: any;
  getStatusBadgeStyle: (status: string) => string;
  getStatusColor: (status: string) => string;
  onWhatsAppClick: (phone: string) => void;
}

export const AthleteCard: React.FC<AthleteCardProps> = ({
  registration,
  isCurrentUser,
  registradorInfo,
  getStatusBadgeStyle,
  getStatusColor,
  onWhatsAppClick,
}) => {
  // A user is considered a dependent if they have a registrador ID
  const isDependent = !!registration.usuario_registrador_id;

  return (
    <Card 
      className={cn(
        getStatusColor(registration.status_pagamento),
        isCurrentUser && 'ring-2 ring-olimpics-orange-primary'
      )}
    >
      <CardContent className="p-6">
        <div className="space-y-4">
          <AthleteCardHeader
            nome={registration.nome_atleta}
            isCurrentUser={isCurrentUser}
            hasRegistrador={isDependent}
            statusPagamento={registration.status_pagamento}
            getStatusBadgeStyle={getStatusBadgeStyle}
            modalidades={registration.modalidades}
            isDependent={isDependent}
          />
          <AthleteInfoGrid
            email={registration.email}
            telefone={registration.telefone}
            filialNome={registration.filial_nome}
            tipoDocumento={registration.tipo_documento}
            numeroDocumento={registration.numero_documento}
            genero={registration.genero}
            onWhatsAppClick={onWhatsAppClick}
            registradorInfo={registradorInfo}
            hasRegistrador={isDependent}
            showRegistradorEmail={isDependent}
          />
        </div>
      </CardContent>
    </Card>
  );
};
