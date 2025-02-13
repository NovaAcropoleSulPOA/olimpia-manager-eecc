
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { PerfilTipo } from "@/lib/types/database";

interface RegistrationFee {
  id: number;
  valor: number;
  perfis: Array<{
    nome: string;
    perfil_tipo_id: string;
    perfis_tipo: Array<{
      codigo: string;
    }>;
  }>;
}

export const useEventRegistration = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, selectedRole }: { eventId: string; selectedRole: PerfilTipo }) => {
      if (!userId) throw new Error('No user ID available');

      console.log('Fetching registration fee for event:', eventId, 'and role:', selectedRole);

      const { data: registrationFees, error: feeError } = await supabase
        .from('taxas_inscricao')
        .select(`
          id,
          valor,
          perfis!fk_taxas_inscricao_perfil (
            nome,
            perfil_tipo_id,
            perfis_tipo:perfil_tipo_id (
              codigo
            )
          )
        `)
        .eq('evento_id', eventId);

      if (feeError) {
        console.error('Error fetching registration fees:', feeError);
        throw new Error('Erro ao buscar taxa de inscrição');
      }

      const matchingFee = (registrationFees as RegistrationFee[])?.find(fee => 
        fee.perfis?.[0]?.perfis_tipo?.[0]?.codigo === selectedRole
      );

      if (!matchingFee) {
        console.error('No matching registration fee found for role:', selectedRole);
        throw new Error('Taxa de inscrição não encontrada para o perfil selecionado');
      }

      console.log('Found registration fee:', matchingFee);

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
