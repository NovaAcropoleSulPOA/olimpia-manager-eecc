
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { User, MapPin, Phone, Mail, Building2, FileText, CreditCard, Info, Lock, Shield } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AthleteProfileProps {
  profile: {
    nome_completo: string;
    telefone: string;
    email: string;
    numero_identificador?: string;
    tipo_documento: string;
    numero_documento: string;
    genero: string;
    filial_nome: string;
    filial_cidade: string;
    filial_estado: string;
    pagamento_status?: string;
    pagamento_valor?: number;
    papeis?: string[];
  };
  isPublicUser: boolean;
}

const getProfileImage = (gender: string | undefined) => {
  switch (gender?.toLowerCase()) {
    case 'masculino':
      return "/lovable-uploads/EECC_marca_portugues_cores_RGB.png";
    case 'feminino':
      return "/lovable-uploads/EECC_marca_portugues_cores_RGB.png";
    default:
      return "/lovable-uploads/EECC_marca_portugues_cores_RGB.png";
  }
};

export default function AthleteProfile({ profile, isPublicUser }: AthleteProfileProps) {
  const navigate = useNavigate();
  
  if (!profile) {
    return null;
  }

  const formatCurrency = (value?: number) => {
    if (!value && value !== 0) return 'Valor não definido';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handlePasswordChange = () => {
    console.log('Navigating to reset password from profile');
    navigate('/reset-password', { 
      state: { 
        fromProfile: true 
      },
      replace: false
    });
  };

  return (
    <div className="space-y-6">
      {!isPublicUser && (
        <Alert className="bg-olimpics-orange-primary/10 border-olimpics-orange-primary text-olimpics-text">
          <Info className="h-5 w-5 text-olimpics-orange-primary" />
          <AlertDescription className="text-sm font-medium">
            As inscrições nas modalidades devem ser feitas no menu 'Minhas Inscrições'.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Profile Image and ID */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative w-48 h-48">
                  <div 
                    className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-10"
                    style={{ 
                      backgroundImage: 'url("/lovable-uploads/LOGO_COMITE_PIERRE_COUBERTIN.png")',
                      backgroundSize: '80%',
                      backgroundPosition: 'center'
                    }}
                  />
                  <img
                    src={getProfileImage(profile.genero)}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover border-4 border-olimpics-green-primary relative z-10"
                  />
                </div>
                <div className="text-center">
                  <div className="bg-olimpics-green-primary text-white px-4 py-2 rounded-lg shadow-lg">
                    <p className="text-sm font-medium">
                      {isPublicUser ? 'PERFIL' : 'ID DO ATLETA'}
                    </p>
                    <p className="text-xl font-bold">
                      {isPublicUser ? 'Público Geral' : profile.numero_identificador}
                    </p>
                  </div>
                </div>
              </div>

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
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Payment Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-olimpics-green-primary">
                  <CreditCard className="h-5 w-5" />
                  Informações de Pagamento
                </h3>
                <div className="space-y-3">
                  <p className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Status do Pagamento: {' '}
                      <span className={`font-medium ${profile.pagamento_status === 'confirmado' ? 'text-green-600' : 'text-orange-500'}`}>
                        {profile.pagamento_status === 'confirmado' ? 'Confirmado' : 'Pendente'}
                      </span>
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Valor do Pagamento: {' '}
                      <span className={`font-medium ${profile.pagamento_status === 'confirmado' ? 'text-green-600' : 'text-orange-500'}`}>
                        {formatCurrency(profile.pagamento_valor)}
                      </span>
                    </span>
                  </p>
                </div>
              </div>

              {/* Branch Information */}
              {profile.filial_nome && (
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
              )}

              {/* User Roles Section */}
              {profile.papeis && profile.papeis.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-olimpics-green-primary">
                    <Shield className="h-5 w-5" />
                    Perfis de Acesso
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {profile.papeis.map((role, index) => (
                      <Badge 
                        key={index}
                        variant="secondary" 
                        className="bg-olimpics-green-primary/10 text-olimpics-green-primary border-olimpics-green-primary/20"
                      >
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Password Change Button */}
              <Button
                onClick={handlePasswordChange}
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <Lock className="h-4 w-4" />
                Alterar Senha
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
