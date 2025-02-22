
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { AthleteModality } from '@/lib/api';

interface AthleteCardHeaderProps {
  nome: string;
  isCurrentUser: boolean;
  hasRegistrador: boolean;
  statusPagamento: string;
  getStatusBadgeStyle: (status: string) => string;
  modalidades: AthleteModality[];
  isDependent: boolean;
  paymentAmount?: string;
}

export const AthleteCardHeader: React.FC<AthleteCardHeaderProps> = ({
  nome,
  isCurrentUser,
  hasRegistrador,
  statusPagamento,
  getStatusBadgeStyle,
  modalidades,
  isDependent,
  paymentAmount
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{nome}</h3>
          <div className="flex flex-wrap gap-1 mt-1">
            {isCurrentUser && (
              <Badge variant="secondary">Você</Badge>
            )}
            {isDependent && (
              <Badge variant="secondary">Dependente</Badge>
            )}
            <Badge className={getStatusBadgeStyle(statusPagamento)}>
              {statusPagamento}
            </Badge>
            {paymentAmount && (
              <Badge variant="outline">{paymentAmount}</Badge>
            )}
          </div>
        </div>
      </div>
      {modalidades.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {modalidades.map((modalidade) => (
            <Badge key={modalidade.id} variant="outline">
              {modalidade.modalidade_nome}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
