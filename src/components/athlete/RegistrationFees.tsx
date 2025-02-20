
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BadgeCheck, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RegistrationFee {
  id: number;
  valor: number;
  isento: boolean;
  perfil: {
    nome: string;
    id: number;
  };
}

interface RegistrationFeesProps {
  eventId: string | null;
  currentProfileId: number | undefined;
}

export function RegistrationFees({ eventId, currentProfileId }: RegistrationFeesProps) {
  const { data: fees, isLoading } = useQuery({
    queryKey: ['registration-fees', eventId],
    queryFn: async () => {
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

      return (data as unknown as RegistrationFee[]) || [];
    },
    enabled: !!eventId
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olimpics-green-primary" />
      </div>
    );
  }

  if (!fees || fees.length === 0) {
    return null;
  }

  // Sort fees to put the current profile first
  const sortedFees = [...fees].sort((a, b) => {
    if (a.perfil.id === currentProfileId) return -1;
    if (b.perfil.id === currentProfileId) return 1;
    return 0;
  });

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-olimpics-orange-primary" />
          Taxas de Inscrição
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-full max-h-[400px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedFees.map((fee) => (
              <Card
                key={fee.id}
                className={cn(
                  "relative overflow-hidden transition-all",
                  fee.perfil.id === currentProfileId && "ring-2 ring-olimpics-orange-primary"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{fee.perfil.nome}</h3>
                      <p className="text-2xl font-bold mt-2">
                        {fee.isento ? (
                          <span className="text-olimpics-green-primary">Isento</span>
                        ) : (
                          `R$ ${fee.valor.toFixed(2)}`
                        )}
                      </p>
                    </div>
                    {fee.perfil.id === currentProfileId && (
                      <BadgeCheck className="h-6 w-6 text-olimpics-orange-primary" />
                    )}
                  </div>
                  {fee.perfil.id === currentProfileId && (
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-olimpics-orange-primary" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
