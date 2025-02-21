
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

      console.log('Retrieved profile data:', {
        userId,
        eventId: currentEventId,
        numero_identificador: profileData.numero_identificador,
        pagamento_status: profileData.pagamento_status,
        payment_info: {
          status: profileData.pagamento_status,
          valor: profileData.pagamento_valor,
          data_criacao: profileData.pagamento_data_criacao,
          data_validacao: profileData.data_validacao
        }
      });

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

      console.log('Transformed roles:', transformedRoles);

      return {
        ...profileData,
        id: profileData.atleta_id,
        papeis: transformedRoles,
        pagamento_status: profileData.pagamento_status?.toLowerCase() || 'pendente'
      } as AthleteProfileData;
    },
    enabled: !!userId && !!currentEventId,
  });
};
