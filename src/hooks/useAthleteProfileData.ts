
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { AthleteProfileData } from "@/types/athlete";

export const useAthleteProfileData = (userId: string | undefined, currentEventId: string | null) => {
  return useQuery({
    queryKey: ['athlete-profile', userId, currentEventId],
    queryFn: async () => {
      if (!userId || !currentEventId) return null;
      console.log('Fetching athlete profile for:', userId, 'event:', currentEventId);

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

      const { data: paymentData, error: paymentError } = await supabase
        .from('pagamentos')
        .select('status')
        .eq('atleta_id', userId)
        .eq('evento_id', currentEventId)
        .single();

      if (paymentError) {
        console.error('Error fetching payment status:', paymentError);
      }

      const transformedRoles = (rolesData || []).map((roleData: any) => ({
        nome: roleData.perfis.nome,
        codigo: roleData.perfis.perfil_tipo.codigo
      }));

      return {
        ...profileData,
        papeis: transformedRoles,
        pagamento_status: paymentData?.status || 'pendente'
      } as AthleteProfileData;
    },
    enabled: !!userId && !!currentEventId,
  });
};
