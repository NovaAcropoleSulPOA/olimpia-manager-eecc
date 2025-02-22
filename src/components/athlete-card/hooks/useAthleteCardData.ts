
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

export const useAthleteCardData = (registration: AthleteManagement) => {
  const [justifications, setJustifications] = useState<Record<string, string>>({});
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});
  const [modalityStatuses, setModalityStatuses] = useState<Record<string, string>>({});
  const [isUpdatingAmount, setIsUpdatingAmount] = useState(false);
  const [localInputAmount, setLocalInputAmount] = useState<string>('');
  const [hasInitialized, setHasInitialized] = useState(false);

  // Query to fetch payment data
  const { data: paymentData, refetch: refetchPayment } = useQuery({
    queryKey: ['payment-amount', registration.id],
    queryFn: async () => {
      if (!registration.id) return null;
      const { data, error } = await supabase
        .from('pagamentos')
        .select('valor, isento')
        .eq('atleta_id', registration.id)
        .eq('evento_id', registration.evento_id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!registration.id,
  });

  // Query to fetch registrator info
  const { data: registradorInfo } = useQuery<RegistradorInfo | null>({
    queryKey: ['registrador', registration.usuario_registrador_id],
    queryFn: async () => {
      if (!registration.usuario_registrador_id) return null;
      
      const { data: userInfo, error: userError } = await supabase
        .from('usuarios')
        .select('nome_completo, email, telefone')
        .eq('id', registration.usuario_registrador_id)
        .maybeSingle();

      if (userError || !userInfo) return null;

      return {
        nome_completo: userInfo.nome_completo,
        email: userInfo.email || '',
        telefone: userInfo.telefone
      };
    },
    enabled: !!registration.usuario_registrador_id,
  });

  // Query to fetch user profiles to determine if the user is a dependent
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
      
      return data as PerfilData[];
    },
    enabled: !!registration.id && !!registration.evento_id,
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
