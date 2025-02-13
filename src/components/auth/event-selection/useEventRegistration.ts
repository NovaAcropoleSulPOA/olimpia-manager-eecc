
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

      console.log('Fetching registration fee for event:', eventId, 'and role:', selectedRole);

      // First, get the perfil_tipo_id for the selected role
      const { data: perfilTipo, error: perfilTipoError } = await supabase
        .from('perfis_tipo')
        .select('id')
        .eq('codigo', selectedRole)
        .single();

      if (perfilTipoError) {
        console.error('Error fetching perfil_tipo:', perfilTipoError);
        throw new Error('Erro ao buscar tipo de perfil');
      }

      // Then get the profile ID for this event and profile type
      const { data: profile, error: profileError } = await supabase
        .from('perfis')
        .select('id')
        .eq('evento_id', eventId)
        .eq('perfil_tipo_id', perfilTipo.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw new Error('Erro ao buscar perfil');
      }

      // Then get the registration fee for this profile
      const { data: registrationFee, error: feeError } = await supabase
        .from('taxas_inscricao')
        .select('id, valor')
        .eq('evento_id', eventId)
        .eq('perfil_id', profile.id)
        .single();

      if (feeError) {
        console.error('Error fetching registration fee:', feeError);
        throw new Error('Erro ao buscar taxa de inscrição');
      }

      console.log('Using registration fee:', registrationFee);

      // Create the event registration with the taxa_inscricao_id
      const { data: registration, error: registrationError } = await supabase
        .from('inscricoes_eventos')
        .insert([
          {
            evento_id: eventId,
            usuario_id: userId,
            selected_role: selectedRole,
            taxa_inscricao_id: registrationFee.id
          }
        ])
        .select()
        .single();

      if (registrationError) {
        console.error('Error registering for event:', registrationError);
        throw registrationError;
      }

      return registration;
    },
    onSuccess: () => {
      toast.success('Inscrição realizada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['active-events'] });
    },
    onError: (error) => {
      console.error('Registration error:', error);
      toast.error('Erro ao realizar inscrição. Tente novamente.');
    }
  });
};

