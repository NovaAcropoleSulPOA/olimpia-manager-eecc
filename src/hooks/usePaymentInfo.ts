
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

      // First, verify user's current payment status
      const { data: paymentStatus, error: statusError } = await supabase
        .from('pagamentos')
        .select('status')
        .eq('atleta_id', userId)
        .eq('evento_id', eventId)
        .maybeSingle();

      if (statusError) {
        console.error('Error fetching payment status:', statusError);
        throw statusError;
      }

      console.log('Payment status from database:', paymentStatus);

      // Check if we should show payment info based on status
      const isPending = !paymentStatus?.status || 
                       paymentStatus.status.toLowerCase() === 'pendente' ||
                       (initialPaymentStatus?.status || '').toLowerCase() === 'pendente';

      if (!isPending) {
        console.log('Payment is not pending, no need to fetch payment info');
        return null;
      }

      // Fetch complete payment information
      const { data: paymentInfo, error: paymentError } = await supabase
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

      if (paymentError) {
        console.error('Error fetching payment info:', paymentError);
        throw paymentError;
      }

      console.log('Raw payment info data:', paymentInfo);

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
    staleTime: 30000, // Cache for 30 seconds
    refetchInterval: 60000, // Refresh every minute
    refetchOnWindowFocus: true,
  });
};
