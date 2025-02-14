
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export const useModalityMutations = (userId: string | undefined, eventId: string | null) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const withdrawMutation = useMutation({
    mutationFn: async (modalityId: number) => {
      if (!userId) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('inscricoes_modalidades')
        .delete()
        .eq('modalidade_id', modalityId)
        .eq('atleta_id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athlete-modalities'] });
      queryClient.invalidateQueries({ queryKey: ['modalities'] });
      queryClient.invalidateQueries({ queryKey: ['personal-schedule-activities'] });
      toast({
        title: "Desistência confirmada",
        description: "Você desistiu da modalidade com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Error withdrawing from modality:', error);
      toast({
        title: "Erro ao desistir",
        description: "Não foi possível processar sua desistência. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (modalityId: number) => {
      if (!userId || !eventId) throw new Error('User not authenticated or no event selected');
      
      const { error } = await supabase
        .from('inscricoes_modalidades')
        .insert([{
          atleta_id: userId,
          modalidade_id: modalityId,
          evento_id: eventId,
          status: 'pendente',
          data_inscricao: new Date().toISOString()
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athlete-modalities'] });
      queryClient.invalidateQueries({ queryKey: ['modalities'] });
      queryClient.invalidateQueries({ queryKey: ['personal-schedule-activities'] });
      toast({
        title: "Inscrição realizada",
        description: "Você se inscreveu na modalidade com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Error registering for modality:', error);
      toast({
        title: "Erro na inscrição",
        description: "Não foi possível processar sua inscrição. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  return { withdrawMutation, registerMutation };
};
