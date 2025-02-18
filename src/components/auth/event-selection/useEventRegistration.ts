
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

export const useEventRegistration = (userId: string | undefined) => {
  return useMutation({
    mutationFn: async ({ eventId }: EventRegistrationParams): Promise<RegistrationResult> => {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      try {
        console.log('Starting registration process for event:', eventId);

        const registrationInfo = await getProfileAndFeeInfo(userId, eventId);
        console.log('Retrieved registration info:', registrationInfo);

        if (!registrationInfo) {
          throw new Error('Could not determine profile and registration fee information');
        }

        // Check existing registration
        const { data: existingRegistration, error: checkError } = await supabase
          .from('inscricoes_eventos')
          .select('id')
          .eq('usuario_id', userId)
          .eq('evento_id', eventId)
          .maybeSingle();

        if (checkError) {
          console.error('Error checking registration:', checkError);
          throw checkError;
        }

        // Create or update registration
        const { data: registration, error: registrationError } = await supabase
          .from('inscricoes_eventos')
          .upsert(
            {
              usuario_id: userId,
              evento_id: eventId,
              selected_role: registrationInfo.perfilId,
              taxa_inscricao_id: registrationInfo.taxaInscricaoId
            },
            {
              onConflict: 'usuario_id,evento_id',
              ignoreDuplicates: false
            }
          )
          .select();

        if (registrationError) {
          console.error('Error creating/updating registration:', registrationError);
          throw registrationError;
        }

        console.log('Registration created/updated:', registration);

        // Assign user profiles
        const { error: profileError } = await supabase
          .rpc('assign_user_profiles', {
            p_user_id: userId,
            p_profile_ids: [registrationInfo.perfilId],
            p_event_id: eventId
          });

        if (profileError) {
          console.error('Error assigning user profiles:', profileError);
          throw profileError;
        }

        return { success: true, isExisting: !!existingRegistration };
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
    // First, get the profile ID for 'Atleta' in this event using a join with perfis table
    const { data: profileData, error: profileError } = await supabase
      .from('perfis')
      .select(`
        id,
        nome,
        taxas_inscricao!inner (
          id,
          valor
        )
      `)
      .eq('evento_id', eventId)
      .eq('nome', 'Atleta')
      .single();

    if (profileError) {
      console.error('Error fetching profile with fee:', profileError);
      throw new Error('Could not find Atleta profile and fee information for this event');
    }

    console.log('Found profile and fee data:', profileData);

    if (!profileData || !profileData.taxas_inscricao) {
      throw new Error('Missing profile or fee information for Atleta');
    }

    // Get user identifier
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('numero_identificador')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user data:', userError);
      throw new Error('Could not fetch user information');
    }

    // Compile the registration information
    const result: ProfileAndFeeInfo = {
      taxaInscricaoId: profileData.taxas_inscricao.id,
      perfilId: profileData.id,
      valor: profileData.taxas_inscricao.valor,
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
