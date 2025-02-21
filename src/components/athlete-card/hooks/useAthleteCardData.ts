
import { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { AthleteManagement } from '@/lib/api';

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

  const { data: userProfiles } = useQuery({
    queryKey: ['user-profiles', registration.id, registration.evento_id],
    queryFn: async () => {
      if (!registration.id || !registration.evento_id) return null;
      
      const { data, error } = await supabase
        .from('papeis_usuarios')
        .select('perfis:perfil_id(nome)')
        .eq('usuario_id', registration.id)
        .eq('evento_id', registration.evento_id);

      if (error) throw error;
      return data;
    },
    enabled: !!registration.id && !!registration.evento_id,
  });

  const { data: registradorInfo } = useQuery({
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

  const isDependent = !!registration.usuario_registrador_id || 
    userProfiles?.some(profile => profile.perfis?.nome === 'Dependente');

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
    isDependent
  };
};
