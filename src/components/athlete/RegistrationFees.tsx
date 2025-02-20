
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from 'lucide-react';
import { useRegistrationFees } from './registration-fees/useRegistrationFees';
import { RegistrationFeeCard } from './registration-fees/RegistrationFeeCard';
import type { RegistrationFeesProps } from './registration-fees/types';

export default function RegistrationFees({ eventId, userProfileId }: RegistrationFeesProps) {
  console.log('RegistrationFees component mounted with:', { eventId, userProfileId });
  
  const { data: fees, isLoading } = useRegistrationFees(eventId);

  console.log('Current fees data:', fees);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olimpics-orange-primary" />
      </div>
    );
  }

  if (!fees || fees.length === 0) {
    console.log('No fees data available');
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-olimpics-orange-primary" />
            Taxas de Inscrição
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            Nenhuma taxa de inscrição disponível.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort fees to put the user's profile first
  const sortedFees = [...fees].sort((a, b) => {
    if (a.perfil?.id === userProfileId) return -1;
    if (b.perfil?.id === userProfileId) return 1;
    return 0;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-olimpics-orange-primary" />
          Taxas de Inscrição
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedFees.map((fee) => (
            <RegistrationFeeCard
              key={fee.id}
              fee={fee}
              isUserFee={fee.perfil?.id === userProfileId}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
