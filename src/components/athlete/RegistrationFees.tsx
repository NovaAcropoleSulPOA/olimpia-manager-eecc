
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BadgeCheck, CreditCard } from 'lucide-react';
import { cn } from "@/lib/utils";

interface RegistrationFee {
  id: number;
  valor: number;
  isento: boolean;
  pix_key: string | null;
  data_limite_inscricao: string | null;
  contato_nome: string | null;
  contato_telefone: string | null;
  qr_code_image: string | null;
  qr_code_codigo: string | null;
  link_formulario: string | null;
  perfil: {
    nome: string;
    id: number;
  };
}

interface RegistrationFeesProps {
  eventId: string | null;
  userProfileId?: number;
}

export default function RegistrationFees({ eventId, userProfileId }: RegistrationFeesProps) {
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
          pix_key,
          data_limite_inscricao,
          contato_nome,
          contato_telefone,
          qr_code_image,
          qr_code_codigo,
          link_formulario,
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

      return (data as any as RegistrationFee[]) || [];
    },
    enabled: !!eventId
  });

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
                    {fee.data_limite_inscricao && (
                      <p className="text-sm text-muted-foreground">
                        Prazo: {new Date(fee.data_limite_inscricao).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                    {(fee.contato_nome || fee.contato_telefone) && (
                      <p className="text-sm text-muted-foreground">
                        {fee.contato_nome && `Contato: ${fee.contato_nome}`}
                        {fee.contato_telefone && ` - ${fee.contato_telefone}`}
                      </p>
                    )}
                  </div>
                  {fee.perfil.id === userProfileId && (
                    <BadgeCheck className="h-6 w-6 text-olimpics-orange-primary" />
                  )}
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
