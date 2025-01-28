import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { User, MapPin, Phone, Mail, Building2, FileText } from "lucide-react";

interface AthleteProfileProps {
  profile: {
    nome_completo: string;
    telefone: string;
    email: string;
    numero_identificador: string;
    tipo_documento: string;
    numero_documento: string;
    genero: string;
    filial_nome: string;
    filial_cidade: string;
    filial_estado: string;
  };
}

const getProfileImage = (gender: string | undefined) => {
  switch (gender?.toLowerCase()) {
    case 'masculino':
      return "/lovable-uploads/71dd91ef-fe30-4b2b-9292-5c7ecebb1b69.png";
    case 'feminino':
      return "/lovable-uploads/781f97ba-e496-4392-92b0-8ea401f0aa3e.png";
    default:
      return "/lovable-uploads/7f5d4c54-bc15-4310-ac7a-ecd055bda99b.png";
  }
};

export default function AthleteProfile({ profile }: AthleteProfileProps) {
  if (!profile) {
    return null;
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid md:grid-cols-12 gap-6">
          {/* Profile Image and ID Section */}
          <div className="md:col-span-3 flex flex-col items-center space-y-4">
            <img
              src={getProfileImage(profile.genero)}
              alt="Profile"
              className="w-48 h-48 rounded-full object-cover border-4 border-olimpics-green-primary"
            />
            <div className="text-center">
              <div className="bg-olimpics-green-primary text-white px-4 py-2 rounded-lg shadow-lg">
                <p className="text-sm font-medium">ID DO ATLETA</p>
                <p className="text-xl font-bold">{profile.numero_identificador}</p>
              </div>
            </div>
          </div>

          {/* Main Information Section */}
          <div className="md:col-span-9 grid md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-olimpics-green-primary">
                <User className="h-5 w-5" />
                Informações Pessoais
              </h3>
              <div className="space-y-3">
                <p className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{profile.nome_completo}</span>
                </p>
                <p className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {profile.tipo_documento}: {profile.numero_documento}
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{profile.telefone}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{profile.email}</span>
                </p>
              </div>
            </div>

            {/* Branch Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-olimpics-green-primary">
                <Building2 className="h-5 w-5" />
                Informações da Filial
              </h3>
              <div className="space-y-3">
                <p className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{profile.filial_nome}</span>
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {profile.filial_cidade}, {profile.filial_estado}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}