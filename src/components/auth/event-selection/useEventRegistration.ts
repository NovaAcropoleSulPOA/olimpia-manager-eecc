
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

      // First, get the perfil_tipo_id for the selected role
      const { data: perfilTipo, error: perfilTipoError } = await supabase
        .from('perfis_tipo')
        .select('id')
        .eq('codigo', selectedRole)
        .maybeSingle();

      if (perfilTipoError) {
        console.error('Error fetching perfil_tipo:', perfilTipoError);
        throw new Error('Erro ao buscar tipo de perfil');
      }

      if (!perfilTipo) {
        console.error('No perfil_tipo found for role:', selectedRole);
        throw new Error('Tipo de perfil não encontrado');
      }

      // Then get the profile ID for this event and profile type
      const { data: profile, error: profileError } = await supabase
        .from('perfis')
        .select('id')
        .eq('evento_id', eventId)
        .eq('perfil_tipo_id', perfilTipo.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw new Error('Erro ao buscar perfil');
      }

      if (!profile) {
        console.error('No profile found for event:', eventId, 'and perfil_tipo:', perfilTipo.id);
        throw new Error('Perfil não encontrado para este evento');
      }

      // Get the registration fee for this profile
      const { data: registrationFee, error: feeError } = await supabase
        .from('taxas_inscricao')
        .select('id, valor')
        .eq('evento_id', eventId)
        .eq('perfil_id', profile.id)
        .maybeSingle();

      if (feeError) {
        console.error('Error fetching registration fee:', feeError);
        throw new Error('Erro ao buscar taxa de inscrição');
      }

      if (!registrationFee) {
        console.error('No registration fee found for profile:', profile.id);
        throw new Error('Taxa de inscrição não encontrada');
      }

      console.log('Using registration fee:', registrationFee);

      // Start a transaction by creating the event registration
      const { data: registration, error: registrationError } = await supabase
        .from('inscricoes_eventos')
        .insert([
          {
            evento_id: eventId,
            usuario_id: userId,
            selected_role: selectedRole.toString(), // Convert enum to string
            taxa_inscricao_id: registrationFee.id
          }
        ])
        .select()
        .maybeSingle();

      if (registrationError) {
        console.error('Error registering for event:', registrationError);
        throw registrationError;
      }

      if (!registration) {
        throw new Error('Erro ao criar inscrição no evento');
      }

      // Create the user role record
      const { error: roleError } = await supabase
        .from('papeis_usuarios')
        .insert([
          {
            usuario_id: userId,
            perfil_id: profile.id,
            evento_id: eventId
          }
        ]);

      if (roleError) {
        console.error('Error creating user role:', roleError);
        throw roleError;
      }

      // Store the current event ID in localStorage
      localStorage.setItem('currentEventId', eventId);

      return registration;
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
