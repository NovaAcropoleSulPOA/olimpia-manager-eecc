
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { PerfilTipo } from "@/lib/types/database";

interface EventRegistrationParams {
  eventId: string;
  selectedRole: PerfilTipo;
}

interface RegistrationResult {
  success: boolean;
  isExisting: boolean;
}

interface ProfileAndFeeInfo {
  taxaInscricaoId: number;
  perfilId: number;
  valor: number;
  numeroIdentificador: string;
  profileName: string;
}

interface ProfileData {
  id: number;
  nome: string;
  evento_id: string;
  taxas_inscricao: {
    id: number;
    valor: number;
    perfil_id: number;
  };
}

export const useEventRegistration = (userId: string | undefined) => {
  return useMutation({
    mutationFn: async ({ eventId }: EventRegistrationParams): Promise<RegistrationResult> => {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      try {
        console.log('Starting registration process for event:', eventId);

        // Step 1: Get profile and fee information
        const registrationInfo = await getProfileAndFeeInfo(userId, eventId);
        console.log('Retrieved registration info:', registrationInfo);

        if (!registrationInfo) {
          throw new Error('Could not determine profile and registration fee information');
        }

        // Step 2: Begin transaction for registration process
        const { error: transactionError } = await supabase.rpc('process_event_registration', {
          p_user_id: userId,
          p_event_id: eventId,
          p_profile_id: registrationInfo.perfilId,
          p_registration_fee_id: registrationInfo.taxaInscricaoId
        });

        if (transactionError) {
          console.error('Error in registration transaction:', transactionError);
          throw new Error('Failed to complete registration process');
        }

        console.log('Registration process completed successfully');
        return { success: true, isExisting: false };

      } catch (error: any) {
        console.error('Registration error:', error);
        toast.error(error.message || 'Erro ao realizar inscrição');
        throw error;
      }
    }
  });
};

async function getProfileAndFeeInfo(
  userId: string,
  eventId: string
): Promise<ProfileAndFeeInfo | null> {
  try {
    console.log('Fetching profile and fee info for:', { userId, eventId });

    // Step 1: Get the Atleta profile with its registration fee
    const { data, error } = await supabase
      .from('perfis')
      .select(`
        id,
        nome,
        taxas_inscricao:taxas_inscricao (
          id,
          valor,
          perfil_id
        )
      `)
      .eq('evento_id', eventId)
      .eq('nome', 'Atleta')
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      throw new Error('Could not find profile information');
    }

    if (!data || !data.taxas_inscricao || data.taxas_inscricao.length === 0) {
      console.error('Missing profile or fee data:', data);
      throw new Error('Registration fee not configured for this profile');
    }

    const profileData = data as ProfileData;
    const feeData = Array.isArray(data.taxas_inscricao) 
      ? data.taxas_inscricao[0]
      : data.taxas_inscricao;

    console.log('Found profile data:', profileData);
    console.log('Found fee data:', feeData);

    // Step 2: Get user identifier
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('numero_identificador')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user data:', userError);
      throw new Error('Could not fetch user information');
    }

    // Step 3: Compile registration information
    const result: ProfileAndFeeInfo = {
      taxaInscricaoId: feeData.id,
      perfilId: profileData.id,
      valor: feeData.valor,
      numeroIdentificador: userData.numero_identificador,
      profileName: profileData.nome
    };

    console.log('Final registration info:', result);
    return result;

  } catch (error) {
    console.error('Error in getProfileAndFeeInfo:', error);
    throw error;
  }
}
