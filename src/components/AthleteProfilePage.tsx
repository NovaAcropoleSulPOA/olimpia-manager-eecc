
import React, { useEffect, useState } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import AthleteScoresSection from './AthleteScoresSection';
import AthleteProfile from './AthleteProfile';
import PaymentInfo from './PaymentInfo';
import { Loader2 } from "lucide-react";
import { EventHeader } from "./athlete/EventHeader";
import { useEventData } from "@/hooks/useEventData";
import { useAthleteProfileData } from "@/hooks/useAthleteProfileData";

export default function AthleteProfilePage() {
  const { user } = useAuth();
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);
  const isPublicUser = user?.papeis?.some(role => role.codigo === 'PGR') || user?.papeis?.length === 0;

  useEffect(() => {
    const eventId = localStorage.getItem('currentEventId');
    if (eventId) {
      setCurrentEventId(eventId);
    }
    console.log('Current event ID from localStorage:', eventId);
  }, []);

  const { data: eventData } = useEventData(currentEventId);
  const { data: profile, isLoading } = useAthleteProfileData(user?.id, currentEventId);

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

  const shouldShowPaymentInfo = !isPublicUser && profile.pagamento_status === 'pendente';

  return (
    <div className="container mx-auto py-6 space-y-8">
      {eventData && <EventHeader eventData={eventData} />}
      <AthleteProfile 
        profile={profile}
        isPublicUser={isPublicUser}
      />
      {shouldShowPaymentInfo && <PaymentInfo key={user?.id} />}
      {!isPublicUser && user?.id && <AthleteScoresSection athleteId={user.id} />}
    </div>
  );
}
