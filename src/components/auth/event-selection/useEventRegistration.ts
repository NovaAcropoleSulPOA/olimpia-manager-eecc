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

    const { data, error } = await supabase
      .from('taxas_inscricao')
      .select(`
        id,
        valor,
        perfil:perfis!inner (
          id,
          nome
        )
      `)
      .eq('evento_id', eventId)
      .eq('perfis.nome', profileName)
      .single();

    if (error) {
      console.error('Error fetching profile and fee:', error);
      throw new Error(`Could not fetch registration fee for ${profileName}`);
    }

    if (!data || !data.perfil) {
      console.error('No fee found for profile:', { profileName, eventId });
      throw new Error(`No registration fee found for ${profileName}`);
    }

    console.log('Retrieved fee data:', data);

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
      taxaInscricaoId: data.id,
      perfilId: data.perfil.id,
      valor: data.valor,
      numeroIdentificador: userData.numero_identificador,
      profileName: data.perfil.nome
    };

    console.log('Final registration info:', result);
    return result;

  } catch (error) {
    console.error('Error in getProfileAndFeeInfo:', error);
    throw error;
  }
}
