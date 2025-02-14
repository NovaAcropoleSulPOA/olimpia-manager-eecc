
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { PerfilTipo } from "@/lib/types/database";

interface RegistrationFee {
  id: number;
  valor: number;
  perfis: {
    nome: string;
    perfil_tipo_id: string;
  };
}

export const useEventRegistration = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, selectedRole }: { eventId: string; selectedRole: PerfilTipo }) => {
      if (!userId) throw new Error('No user ID available');

      console.log('Starting event registration process for event:', eventId, 'role:', selectedRole);

      // Call the assign_age_based_profile function
      const { error: profileError } = await supabase
        .rpc('assign_age_based_profile', {
          p_user_id: userId,
          p_event_id: eventId
        });

      if (profileError) {
        console.error('Error assigning age-based profile:', profileError);
        throw new Error('Erro ao atribuir perfil baseado na idade');
      }

      // The rest of the event registration process will be handled by the database trigger
      // which will use the newly created profile
      return { success: true };
    },
    onSuccess: () => {
      toast.success('Inscrição realizada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['active-events'] });
    },
    onError: (error: Error) => {
      console.error('Registration error:', error);
      toast.error(error.message || 'Erro ao realizar inscrição. Tente novamente.');
    }
  });
};
