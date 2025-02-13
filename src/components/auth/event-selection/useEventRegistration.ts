
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

      // Then use this ID to find the matching registration fee, using explicit relationship alias
      const { data: registrationFees, error: feeError } = await supabase
        .from('taxas_inscricao')
        .select(`
          id,
          valor,
          perfis!fk_taxas_perfil (
            nome,
            perfil_tipo_id
          )
        `)
        .eq('evento_id', eventId)
        .eq('perfis.perfil_tipo_id', perfilTipo.id);

      if (feeError) {
        console.error('Error fetching registration fees:', feeError);
        throw new Error('Erro ao buscar taxa de inscrição');
      }

      console.log('Found registration fees:', registrationFees);

      const matchingFee = registrationFees[0]; // Since we filtered by perfil_tipo_id, we can take the first match

      if (!matchingFee) {
        console.error('No matching registration fee found for role:', selectedRole);
        throw new Error('Taxa de inscrição não encontrada para o perfil selecionado');
      }

      console.log('Using registration fee:', matchingFee);

      const { data: registration, error: registrationError } = await supabase
        .from('inscricoes_eventos')
        .insert([
          {
            evento_id: eventId,
            usuario_id: userId,
            selected_role: selectedRole,
            taxa_inscricao_id: matchingFee.id
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
