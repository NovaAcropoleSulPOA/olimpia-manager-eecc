
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

        let registration;
        if (existingRegistration) {
          // Update existing registration
          const { data: updatedReg, error: updateError } = await supabase
            .from('inscricoes_eventos')
            .update({
              taxa_inscricao_id: registrationInfo.taxaInscricaoId,
              selected_role: registrationInfo.perfilId
            })
            .eq('id', existingRegistration.id)
            .select()
            .single();

          if (updateError) {
            console.error('Error updating registration:', updateError);
            throw updateError;
          }
          registration = updatedReg;
        } else {
          // Create new registration
          const { data: newReg, error: insertError } = await supabase
            .from('inscricoes_eventos')
            .upsert({
              usuario_id: userId,
              evento_id: eventId,
              selected_role: registrationInfo.perfilId,
              taxa_inscricao_id: registrationInfo.taxaInscricaoId
            })
            .select()
            .single();

          if (insertError) {
            console.error('Error creating registration:', insertError);
            throw insertError;
          }
          registration = newReg;
        }

        // Check if a payment record already exists
        const { data: existingPayment } = await supabase
          .from('pagamentos')
          .select('id')
          .eq('atleta_id', userId)
          .eq('evento_id', eventId)
          .maybeSingle();

        if (!existingPayment) {
          // Create payment record only if it doesn't exist
          const { error: paymentError } = await supabase
            .from('pagamentos')
            .insert({
              atleta_id: userId,
              evento_id: eventId,
              taxa_inscricao_id: registrationInfo.taxaInscricaoId,
              valor: registrationInfo.valor,
              status: 'pendente',
              data_criacao: new Date().toISOString(),
              numero_identificador: registrationInfo.numeroIdentificador
            });

          if (paymentError) {
            console.error('Error creating payment record:', paymentError);
            throw paymentError;
          }
        }

        console.log('Successfully created/updated registration and payment record');
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
    // First get user age info
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('data_nascimento, numero_identificador')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user data:', userError);
      throw new Error('Could not fetch user information');
    }

    // Calculate age
    const age = calculateAge(userData.data_nascimento);
    const profileType = getProfileTypeByAge(age);

    // Get profile ID based on age/role
    const { data: profileData, error: profileError } = await supabase
      .from('perfis')
      .select('id')
      .eq('evento_id', eventId)
      .eq('nome', profileType === 'ATL' ? 'Atleta' : 'Público Geral')
      .single();

    if (profileError || !profileData) {
      console.error('Error fetching profile:', profileError);
      throw new Error('Could not determine user profile');
    }

    // Get registration fee information
    const { data: feeData, error: feeError } = await supabase
      .from('taxas_inscricao')
      .select('id, valor')
      .eq('evento_id', eventId)
      .eq('perfil_id', profileData.id)
      .single();

    if (feeError || !feeData) {
      console.error('Error fetching registration fee:', feeError);
      throw new Error('Could not determine registration fee');
    }

    return {
      taxaInscricaoId: feeData.id,
      perfilId: profileData.id,
      valor: feeData.valor,
      numeroIdentificador: userData.numero_identificador
    };
  } catch (error) {
    console.error('Error in getProfileAndFeeInfo:', error);
    return null;
  }
}

function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

function getProfileTypeByAge(age: number): PerfilTipo {
  if (age <= 12) {
    return 'ATL';
  }
  return 'ATL'; // Default to ATL, allow selection in UI for adults
}
