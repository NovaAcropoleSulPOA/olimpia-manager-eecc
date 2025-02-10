
import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import AthleteScoresSection from './AthleteScoresSection';
import AthleteProfile from './AthleteProfile';
import PaymentInfo from './PaymentInfo';
import { Loader2 } from "lucide-react";

interface AthleteProfileData {
  atleta_id: string;
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
  status_confirmacao: boolean;
  papeis?: string[];
  pagamento_status?: string;
  pagamento_valor?: number;
}

export default function AthleteProfilePage() {
  const { user } = useAuth();
  const isPublicUser = user?.papeis?.includes('Público Geral') || user?.papeis?.length === 0;

  const { data: profile, isLoading } = useQuery({
    queryKey: ['athlete-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      console.log('Fetching athlete profile for:', user.id);

      const { data, error } = await supabase
        .from('view_perfil_atleta')
        .select('*')
        .eq('atleta_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }

      console.log('Profile data:', data);
      return data as AthleteProfileData;
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-olimpics-green-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-6 space-y-8">
        <div className="text-center text-olimpics-text">
          Perfil não encontrado. Por favor, entre em contato com o suporte.
        </div>
      </div>
    );
  }

  const isPendingPayment = profile.pagamento_status?.toLowerCase() === 'pendente';

  return (
    <div className="container mx-auto py-6 space-y-8">
      <AthleteProfile 
        profile={{
          ...profile,
          papeis: user?.papeis,
        }}
        isPublicUser={isPublicUser}
      />
      {isPendingPayment && <PaymentInfo key={user?.id} />}
      {!isPublicUser && user?.id && <AthleteScoresSection athleteId={user.id} />}
    </div>
  );
}
