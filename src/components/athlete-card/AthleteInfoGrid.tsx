
import React from 'react';
import { Mail, MessageCircle, Building2, FileText, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RegistradorInfo {
  nome_completo: string;
  email: string;
}

interface AthleteInfoGridProps {
  email: string | null;
  telefone: string;
  filialNome: string;
  tipoDocumento: string;
  numeroDocumento: string;
  genero: string;
  onWhatsAppClick: (phone: string) => void;
  registradorInfo?: RegistradorInfo | null;
  hasRegistrador?: boolean;
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
  hasRegistrador
}) => {
  // Use registrador's email if the dependent doesn't have one
  const displayEmail = email || (hasRegistrador && registradorInfo?.email) || '';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4" />
        <span>{displayEmail}</span>
      </div>
      <div className="flex items-center gap-2">
        <MessageCircle className="h-4 w-4" />
        <Button
          variant="link"
          className="p-0 h-auto font-normal text-olimpics-orange-primary hover:text-olimpics-orange-secondary"
          onClick={() => onWhatsAppClick(telefone)}
        >
          {telefone}
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4" />
        <span>{filialNome}</span>
      </div>
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4" />
        <span>{tipoDocumento}: {numeroDocumento}</span>
      </div>
      <div className="flex items-center gap-2">
        <User className="h-4 w-4" />
        <span>Gênero: {genero}</span>
      </div>
      {registradorInfo && (
        <div className="col-span-2 mt-2 p-2 bg-blue-50 rounded-md">
          <div className="text-sm font-medium text-blue-700 mb-1">Informações do Responsável:</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              <span className="text-blue-700">{registradorInfo.nome_completo}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-600" />
              <span className="text-blue-700">{registradorInfo.email}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
