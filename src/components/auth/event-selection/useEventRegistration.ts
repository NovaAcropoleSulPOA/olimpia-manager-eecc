
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface EventRegistrationParams {
  eventId: string;
  selectedRole: 'ATL' | 'PGR';
}

interface RegistrationResult {
  success: boolean;
  isExisting: boolean;
}

export const useEventRegistration = (userId: string | undefined) => {
  return useMutation({
    mutationFn: async ({ eventId, selectedRole }: EventRegistrationParams): Promise<RegistrationResult> => {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      try {
        // First check if registration exists
        const { data: existingRegistration, error: checkError } = await supabase
          .from('inscricoes_eventos')
          .select('id')
          .eq('usuario_id', userId)
          .eq('evento_id', eventId)
          .single();

        if (checkError && checkError.code !== 'PGRST116') { // Not found error code
          console.error('Error checking existing registration:', checkError);
          throw new Error('Error checking registration status');
        }

        // If registration exists, return success with isExisting flag
        if (existingRegistration) {
          console.log('User already registered for this event');
          return { success: true, isExisting: true };
        }

        // If no existing registration, create new one directly
        const { data, error: insertError } = await supabase
          .from('inscricoes_eventos')
          .insert({
            usuario_id: userId,
            evento_id: eventId,
            selected_role: selectedRole,
            taxa_inscricao_id: await getTaxaInscricaoId(eventId, selectedRole)
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating registration:', insertError);
          throw new Error(insertError.message);
        }

        console.log('Successfully created new registration');
        return { success: true, isExisting: false };
      } catch (error: any) {
        console.error('Registration error:', error);
        toast.error(error.message || 'Erro ao realizar inscrição');
        throw error;
      }
    }
  });
};

// Helper function to get the correct taxa_inscricao_id
async function getTaxaInscricaoId(eventId: string, role: string): Promise<number> {
  const { data, error } = await supabase
    .from('taxas_inscricao')
    .select('id, perfil:perfis(perfil_tipo:perfis_tipo(codigo))')
    .eq('evento_id', eventId)
    .single();

  if (error || !data) {
    console.error('Error fetching taxa_inscricao:', error);
    throw new Error('Could not determine registration fee');
  }

  return data.id;
}
