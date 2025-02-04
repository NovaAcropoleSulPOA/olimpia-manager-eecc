import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { User, MapPin, Phone, Mail, Building2, FileText, CreditCard, Info, Lock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PaymentInfo from './PaymentInfo';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

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
    pagamento_status?: string;
    pagamento_valor?: number;
  };
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

export default function AthleteProfile({ profile }: AthleteProfileProps) {
  const navigate = useNavigate();
  const [isRequestingReset, setIsRequestingReset] = useState(false);

  if (!profile) {
    return null;
  }

  const handlePasswordChange = async () => {
    if (isRequestingReset) {
      toast.error('Por favor, aguarde alguns segundos antes de tentar novamente.');
      return;
    }

    console.log('Initiating password change flow');
    setIsRequestingReset(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('Error initiating password change:', error);
        
        if (error.message.includes('rate_limit')) {
          toast.error('Por favor, aguarde alguns segundos antes de tentar novamente.');
        } else {
          toast.error('Erro ao iniciar alteração de senha. Tente novamente mais tarde.');
        }
        return;
      }

      toast.success('Email de redefinição de senha enviado com sucesso!');
      navigate('/reset-password');
    } catch (error) {
      console.error('Failed to initiate password change:', error);
      toast.error('Erro ao iniciar alteração de senha. Tente novamente mais tarde.');
    } finally {
      // Set a timeout to prevent rapid successive requests
      setTimeout(() => {
        setIsRequestingReset(false);
      }, 60000); // 60 seconds cooldown
    }
  };

  const formatCurrency = (value?: number) => {
    if (!value) return 'Valor não pago';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-olimpics-orange-primary/10 border-olimpics-orange-primary text-olimpics-text">
        <Info className="h-5 w-5 text-olimpics-orange-primary" />
        <AlertDescription className="text-sm font-medium">
          As inscrições nas modalidades devem ser feitas no menu 'Minhas Inscrições'.
        </AlertDescription>
      </Alert>

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
                  <Button
                    onClick={handlePasswordChange}
                    variant="outline"
                    className="w-full mt-4 border-olimpics-green-primary text-olimpics-green-primary hover:bg-olimpics-green-primary hover:text-white"
                    disabled={isRequestingReset}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    {isRequestingReset ? 'Aguarde...' : 'Alterar Senha'}
                  </Button>
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

      {/* Payment Information Section */}
      {profile.pagamento_status !== 'confirmado' && (
        <PaymentInfo />
      )}
    </div>
  );
}