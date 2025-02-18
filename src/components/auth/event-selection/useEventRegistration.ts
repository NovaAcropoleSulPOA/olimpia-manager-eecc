
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

        // Insert or update registration with the correct profile name as selected_role
        const { data: registration, error: registrationError } = await supabase
          .from('inscricoes_eventos')
          .upsert(
            {
              usuario_id: userId,
              evento_id: eventId,
              selected_role: selectedRole, // Use the PerfilTipo enum value directly
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
    console.log(`Fetching profile info for user ${userId} in event ${eventId} with role ${selectedRole}`);

    // Get profile ID based on selected role
    const profileName = selectedRole === 'ATL' ? 'Atleta' : 'Público Geral';
    console.log('Looking for profile with name:', profileName);
    
    // First, get the complete profile information including the id
    const { data: profileData, error: profileError } = await supabase
      .from('perfis')
      .select('id, nome')
      .eq('evento_id', eventId)
      .eq('nome', profileName)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw new Error('Could not determine user profile');
    }

    if (!profileData) {
      console.error('No profile found for:', { eventId, profileName });
      throw new Error(`Profile not found for this event: ${profileName}`);
    }

    console.log('Found profile:', profileData);

    // Get user identifier
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('numero_identificador')
      .eq('id', userId)
      .maybeSingle();

    if (userError) {
      console.error('Error fetching user data:', userError);
      throw new Error('Could not fetch user information');
    }

    if (!userData) {
      console.error('No user found with ID:', userId);
      throw new Error('User not found');
    }

    // Get registration fee information using the profile ID from perfis table
    const { data: feeData, error: feeError } = await supabase
      .from('taxas_inscricao')
      .select('id, valor')
      .eq('evento_id', eventId)
      .eq('perfil_id', profileData.id)
      .maybeSingle();

    if (feeError) {
      console.error('Error fetching registration fee:', feeError);
      throw new Error('Could not determine registration fee');
    }

    if (!feeData) {
      console.error('No registration fee found for profile:', profileData.id);
      throw new Error('Registration fee not configured for this profile');
    }

    console.log('Found fee data:', feeData);

    return {
      taxaInscricaoId: feeData.id,
      perfilId: profileData.id,
      valor: feeData.valor,
      numeroIdentificador: userData.numero_identificador,
      profileName: profileData.nome
    };
  } catch (error) {
    console.error('Error in getProfileAndFeeInfo:', error);
    throw error;
  }
}
