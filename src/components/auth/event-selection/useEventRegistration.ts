
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { differenceInYears } from "date-fns";

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
        // Check if user is already registered for this event
        const { data: existingRegistration, error: checkError } = await supabase
          .from('inscricoes_eventos')
          .select('id')
          .eq('usuario_id', userId)
          .eq('evento_id', eventId)
          .maybeSingle();

        if (checkError) {
          console.error('Error checking existing registration:', checkError);
          throw new Error('Error checking existing registration');
        }

        if (existingRegistration) {
          console.log('User already registered for this event');
          return { success: true };
        }

        // Get user's age
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('data_nascimento')
          .eq('id', userId)
          .maybeSingle();

        if (userError || !userData) {
          console.error('Error fetching user data:', userError);
          throw new Error('Error fetching user data');
        }

        const age = userData.data_nascimento 
          ? differenceInYears(new Date(), new Date(userData.data_nascimento))
          : null;

        const isMinor = age !== null && age < 13;
        const childProfileCode = age !== null && age <= 6 ? 'C-6' : 'C+7';

        // Get profile types we'll need
        const { data: profileTypes, error: profileTypesError } = await supabase
          .from('perfis_tipo')
          .select('id, codigo')
          .in('codigo', isMinor ? [selectedRole, childProfileCode] : [selectedRole]);

        if (profileTypesError || !profileTypes?.length) {
          console.error('Error fetching profile types:', profileTypesError);
          throw new Error('Error fetching profile types');
        }

        // Get profile for the selected role
        const { data: profile, error: profilesError } = await supabase
          .from('perfis')
          .select('id')
          .eq('evento_id', eventId)
          .eq('perfil_tipo_id', profileTypes[0].id)
          .maybeSingle();

        if (profilesError || !profile) {
          console.error('Error fetching profiles:', profilesError);
          throw new Error('Error fetching profiles');
        }

        // Get registration fee for the profile
        const { data: registrationFee, error: feeError } = await supabase
          .from('taxas_inscricao')
          .select('id')
          .eq('evento_id', eventId)
          .eq('perfil_id', profile.id)
          .maybeSingle();

        if (feeError || !registrationFee) {
          console.error('Error fetching registration fee:', feeError);
          throw new Error('Error fetching registration fee');
        }

        // Create the event registration with the fee
        const { error: registrationError } = await supabase
          .from('inscricoes_eventos')
          .insert([{
            usuario_id: userId,
            evento_id: eventId,
            taxa_inscricao_id: registrationFee.id,
            selected_role: selectedRole
          }]);

        if (registrationError) {
          console.error('Error creating registration:', registrationError);
          throw new Error('Error creating registration');
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
