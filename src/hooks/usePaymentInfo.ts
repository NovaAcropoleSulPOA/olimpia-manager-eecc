
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { PaymentFeeInfo } from "@/types/payment";

interface ProfileResponse {
  perfil_id: number;
  perfis: {
    nome: string;
  };
}

interface PaymentFeeResponse {
  valor: number;
  pix_key: string | null;
  data_limite_inscricao: string | null;
  contato_nome: string | null;
  contato_telefone: string | null;
  isento: boolean;
  perfil_id: number;
  qr_code_image: string | null;
  qr_code_codigo: string | null;
  link_formulario: string | null;
  perfis: {
    nome: string;
  } | null;
}

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

      // First, check payment status
      const { data: paymentStatus, error: paymentError } = await supabase
        .from('pagamentos')
        .select('status')
        .eq('atleta_id', userId)
        .eq('evento_id', eventId)
        .maybeSingle();

      if (paymentError) {
        console.error('Error fetching payment status:', paymentError);
        throw paymentError;
      }

      // If payment status is not pending, return null
      if (paymentStatus?.status !== 'pendente') {
        console.log('Payment is not pending, status:', paymentStatus?.status);
        return null;
      }

      // Get user's current profile for the event
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

      // Fetch all payment fees for the event
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
        .eq('evento_id', eventId)
        .order('perfil_id', { ascending: true });

      if (feesError) {
        console.error('Error fetching payment fees:', feesError);
        throw feesError;
      }

      if (!paymentFees?.length) {
        console.log('No payment fees found for event');
        return [];
      }

      // Sort the fees to put the user's profile first
      const sortedFees = [...paymentFees].sort((a, b) => {
        if (a.perfil_id === userProfile?.perfil_id) return -1;
        if (b.perfil_id === userProfile?.perfil_id) return 1;
        return 0;
      });

      // Map and mark the user's current fee
      const mappedFees: PaymentFeeInfo[] = sortedFees.map(fee => ({
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
