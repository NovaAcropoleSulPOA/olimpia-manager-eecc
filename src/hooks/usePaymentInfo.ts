
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
      if (!userId || !eventId) {
        console.log('Missing userId or eventId for payment info query');
        return null;
      }

      console.log('Fetching payment info for user:', userId, 'event:', eventId);

      // Use a single query to get both payment status and fee info
      const { data: paymentInfo, error: paymentError } = await supabase
        .from('mvw_taxas_inscricao_usuarios')
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

      if (paymentError) {
        console.error('Error fetching payment info:', paymentError);
        throw paymentError;
      }

      console.log('Payment info from materialized view:', paymentInfo);

      if (!paymentInfo) {
        console.log('No payment info found in view');
        return initialFeeInfo || null;
      }

      // Merge initial data with fetched data, prioritizing fetched data
      const mergedData: PaymentFeeInfo = {
        ...initialFeeInfo,
        ...(paymentInfo || {}),
      };

      console.log('Final merged payment info:', mergedData);
      return mergedData;
    },
    enabled: !!userId && !!eventId,
    initialData: initialFeeInfo,
    staleTime: 60000, // Cache for 1 minute
    cacheTime: 3600000, // Keep in cache for 1 hour
    refetchOnMount: false, // Don't refetch on mount if we have data
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchInterval: (data) => {
      // Only refetch every 5 minutes if we have data
      return data ? 300000 : false;
    },
  });
};
