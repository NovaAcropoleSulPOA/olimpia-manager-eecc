
import React, { useEffect, useState } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import AthleteScoresSection from './AthleteScoresSection';
import AthleteProfile from './AthleteProfile';
import PaymentInfo from './PaymentInfo';
import { Loader2 } from "lucide-react";
import { EventHeader } from "./athlete/EventHeader";
import { useEventData } from "@/hooks/useEventData";
import { useAthleteProfileData } from "@/hooks/useAthleteProfileData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface PaymentStatus {
  valor: number | null;
  perfil_nome: string | null;
  isento: boolean;
  pagamento_status?: string;
}

export default function AthleteProfilePage() {
  const { user } = useAuth();
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);

  useEffect(() => {
    const eventId = localStorage.getItem('currentEventId');
    if (eventId) {
      setCurrentEventId(eventId);
    }
    console.log('Current event ID from localStorage:', eventId);
  }, []);

  const { data: eventData } = useEventData(currentEventId);
  const { data: profile, isLoading: profileLoading } = useAthleteProfileData(user?.id, currentEventId);

  const { data: paymentStatus, isLoading: paymentLoading } = useQuery({
    queryKey: ['payment-status', user?.id, currentEventId],
    queryFn: async () => {
      if (!user?.id || !currentEventId) return null;
      
      console.log('Fetching payment status for user:', user.id, 'event:', currentEventId);
      
      const { data, error } = await supabase
        .from('vw_taxas_inscricao_usuarios')
        .select(`
          valor,
          perfil_nome,
          isento
        `)
        .eq('usuario_id', user.id)
        .eq('evento_id', currentEventId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching payment status:', error);
        throw error;
      }

      console.log('Payment status response:', data);
      return data as PaymentStatus;
    },
    enabled: !!user?.id && !!currentEventId,
  });

  const isLoading = profileLoading || paymentLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-olimpics-green-primary" />
        </div>
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

  const isAthleteProfile = profile.papeis?.some(role => role.nome === 'Atleta');
  const shouldShowPaymentInfo = isAthleteProfile && !paymentStatus?.isento;

  console.log('Profile and payment check:', {
    isAthleteProfile,
    paymentStatus,
    shouldShowPaymentInfo
  });

  return (
    <div className="container mx-auto py-6 space-y-8">
      {eventData && <EventHeader eventData={eventData} />}
      
      <AthleteProfile 
        profile={profile}
        isPublicUser={!isAthleteProfile}
      />

      {shouldShowPaymentInfo && (
        <PaymentInfo key={`${user?.id}-${currentEventId}`} />
      )}

      {isAthleteProfile && user?.id && (
        <AthleteScoresSection athleteId={user.id} />
      )}
    </div>
  );
}
