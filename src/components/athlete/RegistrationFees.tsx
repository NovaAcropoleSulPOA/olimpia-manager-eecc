
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from 'lucide-react';
import { cn } from "@/lib/utils";

interface RegistrationFeesProps {
  eventId: string | null;
  userProfileId?: number;
}

interface Fee {
  id: number;
  valor: number;
  isento: boolean;
  perfil: {
    nome: string;
    id: number;
  };
}

export default function RegistrationFees({ eventId, userProfileId }: RegistrationFeesProps) {
  console.log('RegistrationFees component mounted with:', { eventId, userProfileId });
  
  const { data: fees, isLoading } = useQuery({
    queryKey: ['registration-fees', eventId],
    queryFn: async () => {
      console.log('Fetching fees for event:', eventId);
      
      if (!eventId) return [];
      
      const { data, error } = await supabase
        .from('taxas_inscricao')
        .select(`
          id,
          valor,
          isento,
          perfil:perfis!inner (
            nome,
            id
          )
        `)
        .eq('evento_id', eventId);

      if (error) {
        console.error('Error fetching registration fees:', error);
        throw error;
      }

      console.log('Fetched fees:', data);
      return (data || []) as Fee[];
    },
    enabled: !!eventId
  });

  console.log('Current fees data:', fees);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olimpics-orange-primary" />
      </div>
    );
  }

  if (!fees || fees.length === 0) {
    return null;
  }

  // Sort fees to put the user's profile first
  const sortedFees = [...fees].sort((a, b) => {
    if (a.perfil.id === userProfileId) return -1;
    if (b.perfil.id === userProfileId) return 1;
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedFees.map((fee) => (
            <Card
              key={fee.id}
              className={cn(
                "relative overflow-hidden transition-all",
                fee.perfil.id === userProfileId && "ring-2 ring-olimpics-orange-primary"
              )}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{fee.perfil.nome}</h3>
                    <p className="text-2xl font-bold">
                      {fee.isento ? (
                        <span className="text-olimpics-green-primary">Isento</span>
                      ) : (
                        `R$ ${fee.valor.toFixed(2)}`
                      )}
                    </p>
                  </div>
                </div>
                {fee.perfil.id === userProfileId && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-olimpics-orange-primary" />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
