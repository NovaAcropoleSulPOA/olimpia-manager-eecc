
import React from 'react';
import { Mail, Phone, Building2, CreditCard, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AthleteInfoGridProps {
  email: string | null;
  telefone: string;
  filialNome?: string;
  tipoDocumento: string;
  numeroDocumento: string;
  genero: string;
  onWhatsAppClick: (phone: string) => void;
  registradorInfo?: any;
  hasRegistrador?: boolean;
  showRegistradorEmail?: boolean;
}

export const AthleteInfoGrid: React.FC<AthleteInfoGridProps> = ({
  email,
  telefone,
  filialNome,
  tipoDocumento,
  numeroDocumento,
  genero,
  onWhatsAppClick,
  registradorInfo,
  hasRegistrador,
  showRegistradorEmail
}) => {
  return (
    <div className="grid grid-cols-1 gap-2">
      {email && (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {email}
            {showRegistradorEmail && " (Email do responsável)"}
          </span>
        </div>
      )}
      
      <div className="flex items-center gap-2">
        <Phone className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm">
          {telefone}
          <Button
            variant="link"
            className="text-olimpics-green-primary p-0 h-auto ml-2"
            onClick={() => onWhatsAppClick(telefone)}
          >
            WhatsApp
          </Button>
        </span>
      </div>

      {filialNome && (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{filialNome}</span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <CreditCard className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm">
          {tipoDocumento}: {numeroDocumento}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm">Gênero: {genero}</span>
      </div>

      {hasRegistrador && registradorInfo && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <div className="text-sm text-muted-foreground">
            <p className="font-medium">Informações do Responsável:</p>
            <p>Nome: {registradorInfo.nome_completo}</p>
            <p>Email: {registradorInfo.email}</p>
            <p>Telefone: {registradorInfo.telefone}</p>
          </div>
        </div>
      )}
    </div>
  );
};
