
import { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { AthleteManagement } from '@/lib/api';

interface RegistradorInfo {
  nome_completo: string;
  email: string;
  telefone: string;
}

interface PerfilData {
  perfil_id: {
    nome: string;
  };
}

// Define the actual shape of the raw Supabase response
interface RawSupabaseResponse {
  perfil: {
    nome: string | null;
  };
}

export const useAthleteCardData = (registration: AthleteManagement) => {
  const [justifications, setJustifications] = useState<Record<string, string>>({});
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});
  const [modalityStatuses, setModalityStatuses] = useState<Record<string, string>>({});
  const [isUpdatingAmount, setIsUpdatingAmount] = useState(false);
  const [localInputAmount, setLocalInputAmount] = useState<string>('');
  const [hasInitialized, setHasInitialized] = useState(false);

  const { data: paymentData, refetch: refetchPayment } = useQuery({
    queryKey: ['payment-amount', registration.id],
    queryFn: async () => {
      if (!registration.id) return null;
      const { data, error } = await supabase
        .from('pagamentos')
        .select('valor, isento')
        .eq('atleta_id', registration.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!registration.id,
  });

  const { data: userProfiles } = useQuery<PerfilData[]>({
    queryKey: ['user-profiles', registration.id, registration.evento_id],
    queryFn: async () => {
      if (!registration.id || !registration.evento_id) return [];
      
      const { data, error } = await supabase
        .from('papeis_usuarios')
        .select(`
          perfil:perfil_id (
            nome
          )
        `)
        .eq('usuario_id', registration.id)
        .eq('evento_id', registration.evento_id);

      if (error) throw error;
      
      // First cast to unknown, then to our known type to satisfy TypeScript
      const typedData = (data as unknown) as RawSupabaseResponse[];
      
      // Transform the data to match our interface
      return typedData.map(item => ({
        perfil_id: {
          nome: item.perfil?.nome || ''
        }
      }));
    },
    enabled: !!registration.id && !!registration.evento_id,
  });

  const { data: registradorInfo } = useQuery<RegistradorInfo | null>({
    queryKey: ['registrador', registration.usuario_registrador_id],
    queryFn: async () => {
      if (!registration.usuario_registrador_id) return null;
      
      const { data: userInfo, error: userError } = await supabase
        .from('usuarios')
        .select('nome_completo, email, telefone')
        .eq('id', registration.usuario_registrador_id)
        .single();

      if (userError || !userInfo) return null;

      return userInfo;
    },
    enabled: !!registration.usuario_registrador_id,
  });

  const hasRegistrador = !!registration.usuario_registrador_id;
  const hasRegistradorInfo = !!registradorInfo;
  const hasDepententProfile = Array.isArray(userProfiles) && 
    userProfiles.some(profile => profile.perfil_id?.nome === 'Dependente');
  const isDependent = hasRegistrador || hasDepententProfile;

  return {
    justifications,
    setJustifications,
    isUpdating,
    setIsUpdating,
    modalityStatuses,
    setModalityStatuses,
    isUpdatingAmount,
    setIsUpdatingAmount,
    localInputAmount,
    setLocalInputAmount,
    hasInitialized,
    setHasInitialized,
    paymentData,
    refetchPayment,
    registradorInfo,
    isDependent,
    hasRegistrador,
    hasRegistradorInfo
  };
};
