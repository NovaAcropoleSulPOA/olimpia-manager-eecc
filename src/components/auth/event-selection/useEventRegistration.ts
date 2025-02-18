
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
    mutationFn: async ({ eventId, selectedRole }: EventRegistrationParams): Promise<RegistrationResult> => {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      try {
        // Get correct profile and registration fee information
        const registrationInfo = await getProfileAndFeeInfo(userId, eventId, selectedRole);
        console.log('Retrieved registration info:', registrationInfo);

        if (!registrationInfo) {
          throw new Error('Could not determine profile and registration fee information');
        }

        // First, check if registration exists
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

        // Insert or update registration with the correct profile ID
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

        // Use the assign_user_profiles function with correct parameters including event_id
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
    // First, let's do a combined query to get both profile and fee information
    const { data: profilesAndFees, error: profileFeeError } = await supabase
      .from('perfis')
      .select(`
        id,
        nome,
        taxas_inscricao!inner(
          id,
          valor,
          perfil_id
        )
      `)
      .eq('evento_id', eventId)
      .eq('nome', selectedRole === 'ATL' ? 'Atleta' : 'Público Geral');

    if (profileFeeError) {
      console.error('Error fetching profile and fee data:', profileFeeError);
      throw new Error('Could not fetch profile and fee information');
    }

    console.log('Retrieved profiles and fees:', profilesAndFees);

    if (!profilesAndFees || profilesAndFees.length === 0) {
      throw new Error(`No profile found for the selected role in this event`);
    }

    const profile = profilesAndFees[0];
    const fee = profile.taxas_inscricao[0];

    if (!fee) {
      throw new Error(`No registration fee found for profile ${profile.nome}`);
    }

    // Get user identifier
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('numero_identificador')
      .eq('id', userId)
      .maybeSingle();

    if (userError || !userData) {
      console.error('Error fetching user data:', userError);
      throw new Error('Could not fetch user information');
    }

    // Log the final fee information being used
    console.log('Using fee information:', {
      profileId: profile.id,
      profileName: profile.nome,
      feeId: fee.id,
      feeValue: fee.valor
    });

    return {
      taxaInscricaoId: fee.id,
      perfilId: profile.id,
      valor: fee.valor,
      numeroIdentificador: userData.numero_identificador,
      profileName: profile.nome
    };
  } catch (error) {
    console.error('Error in getProfileAndFeeInfo:', error);
    throw error;
  }
}
