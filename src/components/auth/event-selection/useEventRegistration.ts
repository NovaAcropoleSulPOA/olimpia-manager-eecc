
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface EventRegistrationParams {
  eventId: string;
  selectedRole: 'ATL' | 'PGR';
}

export const useEventRegistration = (userId: string | undefined) => {
  return useMutation({
    mutationFn: async ({ eventId, selectedRole }: EventRegistrationParams) => {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      try {
        // First, get the profile type ID
        const { data: profileType, error: profileTypeError } = await supabase
          .from('perfis_tipo')
          .select('id')
          .eq('codigo', selectedRole)
          .maybeSingle();

        if (profileTypeError) {
          console.error('Error fetching profile type:', profileTypeError);
          throw new Error('Error fetching profile type');
        }

        if (!profileType) {
          throw new Error('Profile type not found');
        }

        // Then, get the profile ID
        const { data: profile, error: profileError } = await supabase
          .from('perfis')
          .select('id')
          .eq('evento_id', eventId)
          .eq('perfil_tipo_id', profileType.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          throw new Error('Error fetching profile');
        }

        if (!profile) {
          console.error('No profile found for the given event and profile type');
          throw new Error('Profile not found for this event');
        }

        // Get registration fee ID
        const { data: feeData, error: feeError } = await supabase
          .from('taxas_inscricao')
          .select('id, valor')
          .eq('evento_id', eventId)
          .eq('perfil_id', profile.id)
          .maybeSingle();

        if (feeError) {
          console.error('Error fetching registration fee:', feeError);
          throw new Error('Error fetching registration fee');
        }

        if (!feeData) {
          throw new Error('Registration fee not found for this event');
        }

        // Create event registration
        const { error: registrationError } = await supabase
          .from('inscricoes_eventos')
          .insert([{
            usuario_id: userId,
            evento_id: eventId,
            taxa_inscricao_id: feeData.id,
            selected_role: selectedRole
          }]);

        if (registrationError) {
          console.error('Error creating registration:', registrationError);
          throw new Error('Error creating registration');
        }

        // Create user role
        const { error: roleError } = await supabase
          .from('papeis_usuarios')
          .insert([{
            usuario_id: userId,
            perfil_id: profile.id,
            evento_id: eventId
          }]);

        if (roleError) {
          console.error('Error assigning role:', roleError);
          throw new Error('Error assigning role');
        }

        return { success: true };
      } catch (error: any) {
        console.error('Registration error:', error);
        toast.error(error.message || 'Erro ao realizar inscrição');
        throw error;
      }
    }
  });
};
