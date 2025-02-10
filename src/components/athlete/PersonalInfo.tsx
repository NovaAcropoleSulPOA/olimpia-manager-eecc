
import React from 'react';
import { User, FileText, Phone, Mail } from "lucide-react";

interface PersonalInfoProps {
  nome_completo: string;
  tipo_documento: string;
  numero_documento: string;
  telefone: string;
  email: string;
}

export default function PersonalInfo({ 
  nome_completo, 
  tipo_documento, 
  numero_documento, 
  telefone, 
  email 
}: PersonalInfoProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2 text-olimpics-green-primary">
        <User className="h-5 w-5" />
        Informações Pessoais
      </h3>
      <div className="space-y-3">
        <p className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{nome_completo}</span>
        </p>
        <p className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {tipo_documento}: {numero_documento}
          </span>
        </p>
        <p className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{telefone}</span>
        </p>
        <p className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{email}</span>
        </p>
      </div>
    </div>
  );
}
