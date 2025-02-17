
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
        // First check if registration exists - using maybeSingle() instead of single()
        const { data: existingRegistration, error: checkError } = await supabase
          .from('inscricoes_eventos')
          .select('id')
          .eq('usuario_id', userId)
          .eq('evento_id', eventId)
          .maybeSingle();

        if (checkError) {
          console.error('Error checking existing registration:', checkError);
          throw new Error('Error checking registration status');
        }

        // If registration exists, return success with isExisting flag
        if (existingRegistration) {
          console.log('User already registered for this event');
          return { success: true, isExisting: true };
        }

        // Get taxa_inscricao_id first
        const taxaInscricaoId = await getTaxaInscricaoId(eventId, selectedRole);
        console.log('Retrieved taxa_inscricao_id:', taxaInscricaoId);

        // If no existing registration, create new one
        const { data, error: insertError } = await supabase
          .from('inscricoes_eventos')
          .insert({
            usuario_id: userId,
            evento_id: eventId,
            selected_role: selectedRole,
            taxa_inscricao_id: taxaInscricaoId
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

// Updated helper function with correct foreign key relationship
async function getTaxaInscricaoId(eventId: string, role: string): Promise<number> {
  console.log('Getting taxa_inscricao_id for event:', eventId, 'and role:', role);
  
  const { data, error } = await supabase
    .from('taxas_inscricao')
    .select(`
      id,
      perfil:perfis!fk_taxas_inscricao_perfil (
        perfil_tipo:perfis_tipo (codigo)
      )
    `)
    .eq('evento_id', eventId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching taxa_inscricao:', error);
    throw new Error('Could not determine registration fee');
  }

  if (!data) {
    console.error('No taxa_inscricao found for event:', eventId);
    throw new Error('No registration fee found for this event');
  }

  console.log('Retrieved taxa_inscricao data:', data);
  return data.id;
}
