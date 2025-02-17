
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
        console.log('Starting registration process with:', { userId, eventId, selectedRole });
        
        // Check if registration exists first
        const { data: existingRegistration, error: checkError } = await supabase
          .from('inscricoes_eventos')
          .select('id')
          .eq('usuario_id', userId)
          .eq('evento_id', eventId)
          .maybeSingle();

        if (checkError) {
          console.error('Error checking registration:', checkError);
          throw new Error('Error checking registration');
        }

        if (existingRegistration) {
          console.log('User already registered for this event');
          return { success: true };
        }

        // Call the create_event_registration function
        const { error: registrationError } = await supabase.rpc(
          'create_event_registration',
          {
            p_user_id: userId,
            p_event_id: eventId,
            p_role: selectedRole
          }
        );

        if (registrationError) {
          console.error('Error creating registration:', registrationError);
          throw new Error(registrationError.message || 'Error creating registration');
        }

        console.log('Successfully created registration');
        return { success: true };
      } catch (error: any) {
        console.error('Registration error:', error);
        toast.error(error.message || 'Erro ao realizar inscrição');
        throw error;
      }
    }
  });
};
