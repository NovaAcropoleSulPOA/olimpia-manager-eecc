
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { PaymentFeeInfo, PaymentStatus } from "@/types/payment";

export const usePaymentInfo = (
  userId?: string,
  eventId?: string,
  initialPaymentStatus?: PaymentStatus
) => {
  // Convert PaymentStatus to PaymentFeeInfo for initial data
  const initialFeeInfo: PaymentFeeInfo | undefined = initialPaymentStatus ? {
    valor: initialPaymentStatus.valor,
    pix_key: null,
    data_limite_inscricao: null,
    contato_nome: null,
    contato_telefone: null,
    isento: initialPaymentStatus.isento,
    perfil_nome: initialPaymentStatus.perfil_nome,
    qr_code_image: null,
    qr_code_codigo: null,
    link_formulario: null
  } : undefined;

  return useQuery({
    queryKey: ['payment-info', userId, eventId],
    queryFn: async () => {
      if (!userId || !eventId) return null;
      console.log('Fetching payment info for user:', userId, 'event:', eventId);
      
      const { data, error } = await supabase
        .from('vw_taxas_inscricao_usuarios')
        .select(`
          valor,
          pix_key,
          data_limite_inscricao,
          contato_nome,
          contato_telefone,
          isento,
          perfil_nome,
          qr_code_image,
          qr_code_codigo,
          link_formulario
        `)
        .eq('usuario_id', userId)
        .eq('evento_id', eventId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching payment info:', error);
        throw error;
      }

      const mergedData: PaymentFeeInfo = {
        ...initialFeeInfo,
        ...(data || {}),
      } as PaymentFeeInfo;

      console.log('Payment info response:', mergedData);
      return mergedData;
    },
    enabled: !!userId && !!eventId,
    initialData: initialFeeInfo,
  });
};
