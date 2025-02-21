
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { UserPlus2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AthleteCardHeaderProps {
  nome: string;
  isCurrentUser: boolean;
  hasRegistrador: boolean;
  statusPagamento: string;
  getStatusBadgeStyle: (status: string) => string;
}

export const AthleteCardHeader: React.FC<AthleteCardHeaderProps> = ({
  nome,
  isCurrentUser,
  hasRegistrador,
  statusPagamento,
  getStatusBadgeStyle
}) => {
  return (
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">{nome}</h3>
        {isCurrentUser && (
          <Badge variant="secondary" className="bg-olimpics-orange-primary text-white">
            Meu Cadastro
          </Badge>
        )}
        {hasRegistrador && (
          <Badge variant="secondary" className="bg-blue-500 text-white">
            <UserPlus2 className="h-3 w-3 mr-1" />
            Dependente
          </Badge>
        )}
      </div>
      <Badge className={cn("capitalize", getStatusBadgeStyle(statusPagamento))}>
        {statusPagamento}
      </Badge>
    </div>
  );
};
