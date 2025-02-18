
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
  status?: string;
  evento_id: string;
  usuario_id: string;
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
      if (!user?.id || !currentEventId) {
        console.log('Missing user ID or event ID:', { userId: user?.id, eventId: currentEventId });
        return null;
      }
      
      console.log('Fetching payment status for user:', user.id, 'event:', currentEventId);
      
      // First check the pagamentos table
      const { data: paymentData, error: paymentError } = await supabase
        .from('pagamentos')
        .select('*')
        .eq('atleta_id', user.id)
        .eq('evento_id', currentEventId)
        .maybeSingle();

      if (paymentError) {
        console.error('Error fetching payment data:', paymentError);
        throw paymentError;
      }

      // Then get the registration fee info
      const { data: feeData, error: feeError } = await supabase
        .from('vw_taxas_inscricao_usuarios')
        .select('*')
        .eq('usuario_id', user.id)
        .eq('evento_id', currentEventId)
        .maybeSingle();

      if (feeError) {
        console.error('Error fetching fee data:', feeError);
        throw feeError;
      }

      // Log both results for debugging
      console.log('Payment data from pagamentos:', paymentData);
      console.log('Fee data from view:', feeData);

      // Combine the data, with paymentData taking precedence
      const combinedData = {
        valor: feeData?.valor || paymentData?.valor || 0,
        perfil_nome: profile?.papeis?.[0]?.nome || null,
        isento: false, // Default to false since we know this user needs to pay
        status: paymentData?.status || 'pendente',
        evento_id: currentEventId,
        usuario_id: user.id,
        ...feeData // Include any additional fee data
      };

      console.log('Combined payment status:', combinedData);
      return combinedData as PaymentStatus;
    },
    enabled: !!user?.id && !!currentEventId && !!profile,
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
  const shouldShowPaymentInfo = isAthleteProfile && paymentStatus && !paymentStatus.isento;

  // Enhanced logging for debugging
  console.log('Profile and payment check:', {
    isAthleteProfile,
    paymentStatus,
    shouldShowPaymentInfo,
    userId: user?.id,
    eventId: currentEventId,
    profileRoles: profile.papeis
  });

  return (
    <div className="container mx-auto py-6 space-y-8">
      {eventData && <EventHeader eventData={eventData} />}
      
      <AthleteProfile 
        profile={profile}
        isPublicUser={!isAthleteProfile}
      />

      {isAthleteProfile && user?.id && (
        <AthleteScoresSection athleteId={user.id} />
      )}

      {/* Moved PaymentInfo rendering here and added debug div */}
      {shouldShowPaymentInfo ? (
        <PaymentInfo key={`${user?.id}-${currentEventId}`} />
      ) : (
        <div className="hidden">
          Debug info (not visible): Payment info hidden because:
          isAthleteProfile: {String(isAthleteProfile)},
          paymentStatus exists: {String(!!paymentStatus)},
          isento: {String(paymentStatus?.isento)}
        </div>
      )}
    </div>
  );
}
