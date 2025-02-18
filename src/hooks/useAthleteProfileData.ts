import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { AthleteProfileData } from "@/types/athlete";

export const useAthleteProfileData = (userId: string | undefined, currentEventId: string | null) => {
  return useQuery({
    queryKey: ['athlete-profile', userId, currentEventId],
    queryFn: async () => {
      if (!userId || !currentEventId) return null;
      console.log('Fetching athlete profile for:', userId, 'event:', currentEventId);

      // Get profile data including payment status from the view
      const { data: profileData, error: profileError } = await supabase
        .from('view_perfil_atleta')
        .select('*')
        .eq('atleta_id', userId)
        .eq('evento_id', currentEventId)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw profileError;
      }

      if (!profileData) {
        console.log('No profile data found for event');
        return null;
      }

      // Get user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('papeis_usuarios')
        .select(`
          perfis (
            nome,
            perfil_tipo:perfil_tipo_id (
              codigo
            )
          )
        `)
        .eq('usuario_id', userId)
        .eq('evento_id', currentEventId);

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
        throw rolesError;
      }

      const transformedRoles = (rolesData || []).map((roleData: any) => ({
        nome: roleData.perfis.nome,
        codigo: roleData.perfis.perfil_tipo.codigo
      }));

      // Get the most recent payment status directly from the pagamentos table
      const { data: paymentData, error: paymentError } = await supabase
        .from('pagamentos')
        .select('status')
        .eq('atleta_id', userId)
        .eq('evento_id', currentEventId)
        .order('data_criacao', { ascending: false })
        .maybeSingle();

      if (paymentError) {
        console.error('Error fetching payment status:', paymentError);
      }

      // Use the payment status from the pagamentos table if available,
      // otherwise use the status from the view, defaulting to 'pendente'
      const paymentStatus = (paymentData?.status || profileData.pagamento_status || 'pendente').toLowerCase();

      console.log('Payment status determined:', {
        fromPaymentTable: paymentData?.status,
        fromProfileView: profileData.pagamento_status,
        finalStatus: paymentStatus
      });

      return {
        ...profileData,
        papeis: transformedRoles,
        pagamento_status: paymentStatus
      } as AthleteProfileData;
    },
    enabled: !!userId && !!currentEventId,
  });
};
