
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AthleteManagement } from '@/lib/api';
import { AthleteCardHeader } from '../AthleteCardHeader';
import { AthleteInfoGrid } from '../AthleteInfoGrid';
import { useAthleteCardData } from '../hooks/useAthleteCardData';
import { formatToCurrency } from '@/utils/formatters';

interface AthleteCardProps {
  registration: AthleteManagement;
  isCurrentUser: boolean;
  getStatusBadgeStyle: (status: string) => string;
  getStatusColor: (status: string) => string;
  onWhatsAppClick: (phone: string) => void;
}

export const AthleteCard: React.FC<AthleteCardProps> = ({
  registration,
  isCurrentUser,
  getStatusBadgeStyle,
  getStatusColor,
  onWhatsAppClick,
}) => {
  const { 
    registradorInfo,
    isDependent,
    paymentData
  } = useAthleteCardData(registration);

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
            hasRegistrador={!!registration.usuario_registrador_id}
            statusPagamento={registration.status_pagamento}
            getStatusBadgeStyle={getStatusBadgeStyle}
            modalidades={registration.modalidades}
            isDependent={isDependent}
            paymentAmount={paymentData?.valor ? formatToCurrency(paymentData.valor) : undefined}
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
            hasRegistrador={!!registration.usuario_registrador_id}
            showRegistradorEmail={!!registration.usuario_registrador_id}
          />
        </div>
      </CardContent>
    </Card>
  );
};
