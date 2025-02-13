
import React, { useEffect, useState } from 'react';
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
  status_confirmacao: boolean;
  papeis?: { nome: string; codigo: string; }[];
  pagamento_status?: string;
  pagamento_valor?: number;
}

interface Event {
  id: string;
  nome: string;
}

export default function AthleteProfilePage() {
  const { user } = useAuth();
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);
  const isPublicUser = user?.papeis?.some(role => role.codigo === 'PGR') || user?.papeis?.length === 0;

  // Get current event ID from localStorage on component mount
  useEffect(() => {
    const eventId = localStorage.getItem('currentEventId');
    if (eventId) {
      setCurrentEventId(eventId);
    }
    console.log('Current event ID from localStorage:', eventId);
  }, []);

  // Fetch event details
  const { data: eventData } = useQuery({
    queryKey: ['event', currentEventId],
    queryFn: async () => {
      if (!currentEventId) return null;
      
      const { data, error } = await supabase
        .from('eventos')
        .select('id, nome')
        .eq('id', currentEventId)
        .single();

      if (error) {
        console.error('Error fetching event:', error);
        return null;
      }

      return data as Event;
    },
    enabled: !!currentEventId,
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['athlete-profile', user?.id, currentEventId],
    queryFn: async () => {
      if (!user?.id || !currentEventId) return null;
      console.log('Fetching athlete profile for:', user.id, 'event:', currentEventId);

      // First fetch the base profile data
      const { data: profileData, error: profileError } = await supabase
        .from('view_perfil_atleta')
        .select('*')
        .eq('atleta_id', user.id)
        .eq('evento_id', currentEventId)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw profileError;
      }

      if (!profileData) {
        console.log('No profile data found for event');
        return null;
      }

      // Then, fetch the user's roles for this event
      const { data: rolesData, error: rolesError } = await supabase
        .from('papeis_usuarios')
        .select(`
          perfis:perfil_id (
            nome,
            perfil_tipo:perfil_tipo_id (
              codigo
            )
          )
        `)
        .eq('usuario_id', user.id)
        .eq('evento_id', currentEventId);

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
        throw rolesError;
      }

      // Transform the roles data
      const transformedRoles = (rolesData || []).map(role => ({
        nome: role.perfis.nome,
        codigo: role.perfis.perfil_tipo.codigo
      }));

      console.log('Profile data:', profileData);
      console.log('Transformed roles:', transformedRoles);

      return {
        ...profileData,
        papeis: transformedRoles
      } as AthleteProfileData;
    },
    enabled: !!user?.id && !!currentEventId,
  });

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

  const isPendingPayment = profile.pagamento_status?.toLowerCase() === 'pendente';

  return (
    <div className="container mx-auto py-6 space-y-8">
      {eventData && (
        <h1 className="text-2xl font-bold text-olimpics-green-primary mb-6">
          {eventData.nome}
        </h1>
      )}
      <AthleteProfile 
        profile={profile}
        isPublicUser={isPublicUser}
      />
      {isPendingPayment && <PaymentInfo key={user?.id} />}
      {!isPublicUser && user?.id && <AthleteScoresSection athleteId={user.id} />}
    </div>
  );
}
