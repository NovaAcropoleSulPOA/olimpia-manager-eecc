
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

// Add interface for the Supabase query response
interface TaxaInscricaoWithPerfil {
  id: number;
  valor: number;
  perfil: {
    id: number;
    nome: string;
  };
}

export const useEventRegistration = (userId: string | undefined) => {
  return useMutation({
    mutationFn: async ({ eventId, selectedRole }: EventRegistrationParams): Promise<RegistrationResult> => {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      try {
        const registrationInfo = await getProfileAndFeeInfo(userId, eventId, selectedRole);
        console.log('Retrieved registration info:', registrationInfo);

        if (!registrationInfo) {
          throw new Error('Could not determine profile and registration fee information');
        }

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
    const profileName = selectedRole === 'ATL' ? 'Atleta' : 'Público Geral';
    console.log('Looking for profile:', { profileName, eventId });

    // First, get the profile ID for the given event and profile name
    const { data: profileData, error: profileError } = await supabase
      .from('perfis')
      .select('id, nome')
      .eq('evento_id', eventId)
      .eq('nome', profileName)
      .single();

    if (profileError || !profileData) {
      console.error('Error fetching profile:', profileError);
      throw new Error(`Could not find profile ${profileName} for this event`);
    }

    console.log('Found profile:', profileData);

    // Then, get the registration fee using the profile ID
    const { data: feeData, error: feeError } = await supabase
      .from('taxas_inscricao')
      .select(`
        id,
        valor,
        perfil:perfil_id (
          id,
          nome
        )
      `)
      .eq('evento_id', eventId)
      .eq('perfil_id', profileData.id)
      .single() as { data: TaxaInscricaoWithPerfil | null; error: any };

    if (feeError || !feeData) {
      console.error('Error fetching registration fee:', feeError);
      throw new Error(`No registration fee found for ${profileName}`);
    }

    console.log('Retrieved fee data:', feeData);

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

    const result = {
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
