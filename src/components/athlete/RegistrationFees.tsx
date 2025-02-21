
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CreditCard } from 'lucide-react';
import { useRegistrationFees } from './registration-fees/useRegistrationFees';
import { RegistrationFeeCard } from './registration-fees/RegistrationFeeCard';
import type { RegistrationFeesProps, Fee } from './registration-fees/types';

export default function RegistrationFees({ eventId, userProfileId }: RegistrationFeesProps) {
  console.log('RegistrationFees component mounted with:', { eventId, userProfileId });
  
  const { data: fees, isLoading, error } = useRegistrationFees(eventId);

  console.log('Current fees data:', fees);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olimpics-orange-primary" />
      </div>
    );
  }

  if (error) {
    console.error('Error loading registration fees:', error);
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
            Erro ao carregar taxas de inscrição. Por favor, tente novamente mais tarde.
          </div>
        </CardContent>
      </Card>
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

  // Filter fees to only show those with show_card = true
  const visibleFees = fees.filter(fee => fee.mostra_card);

  // Separate regular and exempt fees
  const regularFees = visibleFees.filter(fee => !fee.isento);
  const exemptFees = visibleFees.filter(fee => fee.isento);

  // Sort regular fees to put user's fee first
  const sortedRegularFees = [...regularFees].sort((a: Fee, b: Fee) => {
    if (a.isUserFee) return -1;
    if (b.isUserFee) return 1;
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
        <div className="space-y-6">
          {/* Regular fees */}
          {sortedRegularFees.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedRegularFees.map((fee) => (
                <RegistrationFeeCard
                  key={fee.id}
                  fee={fee}
                />
              ))}
            </div>
          )}

          {/* Show separator and exempt fees only if there are any */}
          {exemptFees.length > 0 && (
            <>
              {sortedRegularFees.length > 0 && <Separator className="my-6" />}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exemptFees.map((fee) => (
                  <RegistrationFeeCard
                    key={fee.id}
                    fee={fee}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
