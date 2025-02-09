
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
  const isPublicUser = user?.papeis?.includes('Público Geral') || user?.papeis?.length === 0;

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
      console.log('Profile data:', data);
      return data as AthleteProfileData;
    },
    enabled: !!user?.id,
  });

  // Fetch payment status for all users (both athletes and public)
  const { data: paymentStatus, isLoading: paymentLoading } = useQuery({
    queryKey: ['payment-status', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      console.log('Fetching payment status for:', user.id);
      
      if (isPublicUser) {
        // For public users, check their payment status from pagamentos table
        const { data, error } = await supabase
          .from('pagamentos')
          .select('status')
          .eq('atleta_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching public user payment status:', error);
          throw error;
        }
        console.log('Public user payment status:', data);
        return data as PaymentStatus;
      } else {
        // For athletes, check their payment status from pagamentos table
        const { data, error } = await supabase
          .from('pagamentos')
          .select('status')
          .eq('atleta_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching athlete payment status:', error);
          throw error;
        }
        console.log('Athlete payment status:', data);
        return data as PaymentStatus;
      }
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

  if (!profile && !isPublicUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Perfil não encontrado</p>
      </div>
    );
  }

  // Case-insensitive check for payment status for all users
  const isPendingPayment = paymentStatus?.status?.toLowerCase() === 'pendente';
  console.log('Payment status check:', {
    rawStatus: paymentStatus?.status,
    isPending: isPendingPayment,
    isPublicUser,
  });

  return (
    <div className="container mx-auto py-6 space-y-8">
      <AthleteProfile 
        profile={profile || {
          nome_completo: user?.nome_completo || '',
          email: user?.email || '',
          telefone: user?.telefone || '',
          tipo_documento: user?.tipo_documento || '',
          numero_documento: user?.numero_documento || '',
          filial_nome: '',
          filial_cidade: '',
          filial_estado: '',
          genero: user?.genero || '',
        }} 
        isPublicUser={isPublicUser}
      />
      {/* Show PaymentInfo for any user with pending payment */}
      {isPendingPayment && <PaymentInfo key={user?.id} />}
      {/* Show AthleteScoresSection only for athletes */}
      {!isPublicUser && user?.id && <AthleteScoresSection athleteId={user.id} />}
    </div>
  );
}
