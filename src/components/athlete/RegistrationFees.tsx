
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Link as LinkIcon, Phone, User, Calendar } from 'lucide-react';
import { cn } from "@/lib/utils";
import { format } from 'date-fns';

interface RegistrationFeesProps {
  eventId: string | null;
  userProfileId?: number;
}

interface Fee {
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
          pix_key,
          data_limite_inscricao,
          contato_nome,
          contato_telefone,
          qr_code_image,
          qr_code_codigo,
          link_formulario,
          perfil:perfis (
            nome,
            id
          )
        `)
        .eq('evento_id', eventId);

      if (error) {
        console.error('Error fetching registration fees:', error);
        throw error;
      }

      // Transform the data to match our Fee interface
      const transformedData = (data || []).map(item => ({
        ...item,
        perfil: Array.isArray(item.perfil) ? item.perfil[0] : item.perfil
      }));

      console.log('Raw fees data:', data);
      console.log('Transformed fees:', transformedData);
      return transformedData as Fee[];
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
          {sortedFees.map((fee) => {
            const isUserFee = fee.perfil?.id === userProfileId;
            
            return (
              <Card
                key={fee.id}
                className={cn(
                  "relative overflow-hidden transition-all",
                  isUserFee && "ring-2 ring-olimpics-orange-primary"
                )}
              >
                <CardContent className="p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{fee.perfil?.nome || 'Taxa de Inscrição'}</h3>
                      <p className="text-2xl font-bold">
                        {fee.isento ? (
                          <span className="text-olimpics-green-primary">Isento</span>
                        ) : (
                          `R$ ${fee.valor.toFixed(2)}`
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Show all payment details for every card */}
                  <div className="space-y-4 pt-4 border-t">
                    {fee.data_limite_inscricao && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Data limite: {format(new Date(fee.data_limite_inscricao), 'dd/MM/yyyy')}</span>
                      </div>
                    )}

                    {fee.contato_nome && (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>Contato: {fee.contato_nome}</span>
                      </div>
                    )}

                    {fee.contato_telefone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>Telefone: {fee.contato_telefone}</span>
                      </div>
                    )}

                    {fee.pix_key && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Chave PIX:</p>
                        <code className="bg-muted px-2 py-1 rounded text-sm block break-all">
                          {fee.pix_key}
                        </code>
                      </div>
                    )}

                    {fee.qr_code_image && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">QR Code PIX:</p>
                        <img 
                          src={fee.qr_code_image} 
                          alt="QR Code PIX"
                          className="max-w-[200px] mx-auto"
                        />
                      </div>
                    )}

                    {fee.qr_code_codigo && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Código PIX:</p>
                        <code className="bg-muted px-2 py-1 rounded text-sm block break-all">
                          {fee.qr_code_codigo}
                        </code>
                      </div>
                    )}

                    {fee.link_formulario && (
                      <div className="flex items-center gap-2 text-sm">
                        <LinkIcon className="h-4 w-4 text-muted-foreground" />
                        <a 
                          href={fee.link_formulario}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-olimpics-orange-primary hover:underline"
                        >
                          Formulário de pagamento
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
