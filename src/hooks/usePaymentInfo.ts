
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { PaymentFeeInfo } from "@/types/payment";

export const usePaymentInfo = (
  userId?: string,
  eventId?: string
) => {
  return useQuery({
    queryKey: ['payment-info', userId, eventId],
    queryFn: async () => {
      if (!userId || !eventId) {
        console.log('Missing userId or eventId for payment info query');
        return null;
      }

      console.log('Fetching payment info for user:', userId, 'event:', eventId);

      // First, get user's current profile for the event
      const { data: userProfile, error: profileError } = await supabase
        .from('papeis_usuarios')
        .select(`
          perfil_id,
          perfis (
            nome
          )
        `)
        .eq('usuario_id', userId)
        .eq('evento_id', eventId)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        throw profileError;
      }

      // Then fetch all payment fees for the event
      const { data: paymentFees, error: feesError } = await supabase
        .from('taxas_inscricao')
        .select(`
          valor,
          pix_key,
          data_limite_inscricao,
          contato_nome,
          contato_telefone,
          isento,
          perfil_id,
          qr_code_image,
          qr_code_codigo,
          link_formulario,
          perfis (
            nome
          )
        `)
        .eq('evento_id', eventId);

      if (feesError) {
        console.error('Error fetching payment fees:', feesError);
        throw feesError;
      }

      if (!paymentFees?.length) {
        console.log('No payment fees found for event');
        return [];
      }

      // Map and mark the user's current fee
      const mappedFees: PaymentFeeInfo[] = paymentFees.map(fee => ({
        valor: fee.valor,
        pix_key: fee.pix_key,
        data_limite_inscricao: fee.data_limite_inscricao,
        contato_nome: fee.contato_nome,
        contato_telefone: fee.contato_telefone,
        isento: fee.isento,
        perfil_nome: fee.perfis?.nome || null,
        qr_code_image: fee.qr_code_image,
        qr_code_codigo: fee.qr_code_codigo,
        link_formulario: fee.link_formulario,
        perfil_id: fee.perfil_id,
        is_current_profile: fee.perfil_id === userProfile?.perfil_id
      }));

      console.log('Mapped payment fees:', mappedFees);
      return mappedFees;
    },
    enabled: !!userId && !!eventId,
    staleTime: 60000, // Cache for 1 minute
    gcTime: 3600000, // Keep in cache for 1 hour
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });
};
