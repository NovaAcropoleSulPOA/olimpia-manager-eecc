
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
}

interface PaymentStatus {
  status: string;
}

export default function AthleteProfilePage() {
  const { user } = useAuth();

  // Fetch athlete profile
  const { data: profile, isLoading: profileLoading } = useQuery({
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
        console.error('Error fetching athlete profile:', error);
        throw error;
      }
      return data as AthleteProfileData;
    },
    enabled: !!user?.id,
  });

  // Fetch payment status from pagamentos table
  const { data: paymentStatus, isLoading: paymentLoading } = useQuery({
    queryKey: ['payment-status', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      console.log('Fetching payment status for:', user.id);
      const { data, error } = await supabase
        .from('pagamentos')
        .select('status')
        .eq('atleta_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching payment status:', error);
        throw error;
      }
      console.log('Payment status data:', data);
      return data as PaymentStatus;
    },
    enabled: !!user?.id,
  });

  if (profileLoading || paymentLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-olimpics-green-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Perfil não encontrado</p>
      </div>
    );
  }

  // Log payment status for debugging
  console.log('Raw payment status:', paymentStatus?.status);
  const isPendingPayment = paymentStatus?.status?.toLowerCase() === 'pendente';
  console.log('Is payment pending? (case-insensitive check):', isPendingPayment);

  return (
    <div className="container mx-auto py-6 space-y-8">
      <AthleteProfile profile={profile} />
      {/* Show PaymentInfo when status is 'pendente' (case-insensitive) */}
      {isPendingPayment && <PaymentInfo />}
      {user?.id && <AthleteScoresSection athleteId={user.id} />}
    </div>
  );
}
