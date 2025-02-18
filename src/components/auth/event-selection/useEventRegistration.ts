
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

interface TaxaInscricao {
  id: number;
  valor: number;
  perfil_id: number;
  evento_id: string;
}

export const useEventRegistration = (userId: string | undefined) => {
  return useMutation({
    mutationFn: async ({ eventId, selectedRole }: EventRegistrationParams): Promise<RegistrationResult> => {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      try {
        console.log('Starting registration process with:', { userId, eventId, selectedRole });

        const registrationInfo = await getProfileAndFeeInfo(userId, eventId, selectedRole);
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

        console.log('Successfully created/updated registration with profile ID:', registrationInfo.perfilId);
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
  eventId: string,
  selectedRole: PerfilTipo
): Promise<ProfileAndFeeInfo | null> {
  try {
    // Step 1: Determine profile name based on selected role
    const profileName = selectedRole === 'ATL' ? 'Atleta' : 'Público Geral';
    console.log('Step 1 - Looking for profile:', { profileName, eventId, selectedRole });

    // Step 2: Get profile ID for the given event and profile name
    const { data: profiles, error: profileError } = await supabase
      .from('perfis')
      .select('*')
      .eq('evento_id', eventId)
      .eq('nome', profileName);

    if (profileError) {
      console.error('Error fetching profiles:', profileError);
      throw new Error(`Could not find profiles for event ${eventId}`);
    }

    console.log('Step 2 - Found profiles:', profiles);

    if (!profiles || profiles.length === 0) {
      throw new Error(`No profile found for ${profileName} in this event`);
    }

    const profileData = profiles[0];
    console.log('Step 3 - Selected profile:', profileData);

    // Step 4: Get the registration fee with detailed logging
    const { data: fees, error: feeError } = await supabase
      .from('taxas_inscricao')
      .select('*')
      .eq('evento_id', eventId)
      .eq('perfil_id', profileData.id);

    if (feeError) {
      console.error('Error fetching registration fees:', feeError);
      throw new Error(`Error fetching fees: ${feeError.message}`);
    }

    console.log('Step 4 - Found fees:', fees);

    if (!fees || fees.length === 0) {
      throw new Error(`No registration fee found for profile ${profileName} (ID: ${profileData.id})`);
    }

    const feeData = fees[0];
    console.log('Step 5 - Selected fee:', feeData);

    // Step 6: Get user identifier
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('numero_identificador')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user data:', userError);
      throw new Error('Could not fetch user information');
    }

    console.log('Step 6 - User data:', userData);

    // Step 7: Prepare final result
    const result: ProfileAndFeeInfo = {
      taxaInscricaoId: feeData.id,
      perfilId: profileData.id,
      valor: feeData.valor,
      numeroIdentificador: userData.numero_identificador,
      profileName: profileData.nome
    };

    console.log('Step 7 - Final registration info:', result);
    return result;

  } catch (error) {
    console.error('Error in getProfileAndFeeInfo:', error);
    throw error;
  }
}
