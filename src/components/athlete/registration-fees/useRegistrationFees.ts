
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Fee, UserProfile } from './types';

export function useRegistrationFees(eventId: string | null) {
  return useQuery({
    queryKey: ['registration-fees', eventId],
    queryFn: async () => {
      console.log('Fetching fees for event:', eventId);
      
      if (!eventId) return [];
      
      // Get all fees
      const { data: feesData, error: feesError } = await supabase
        .from('taxas_inscricao')
        .select(`
          id,
          valor,
          isento,
          mostra_card,
          pix_key,
          data_limite_inscricao,
          contato_nome,
          contato_telefone,
          qr_code_image,
          qr_code_codigo,
          link_formulario,
          perfil:perfis!fk_taxas_inscricao_perfil (
            id,
            nome
          )
        `)
        .eq('evento_id', eventId);

      if (feesError) {
        console.error('Error fetching registration fees:', feesError);
        throw feesError;
      }

      // Get the current user's profiles for this event
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user found');
      }

      const { data: userProfiles, error: profilesError } = await supabase
        .from('papeis_usuarios')
        .select(`
          perfis (
            nome,
            perfil_tipo:perfil_tipo_id (
              codigo
            )
          )
        `)
        .eq('usuario_id', user.id)
        .eq('evento_id', eventId);

      if (profilesError) {
        console.error('Error fetching user profiles:', profilesError);
        throw profilesError;
      }

      console.log('User profiles:', userProfiles);
      console.log('Raw fees data:', feesData);

      const transformedFees = (feesData || []).map(fee => {
        const normalizedFee = {
          ...fee,
          perfil: Array.isArray(fee.perfil) ? fee.perfil[0] : fee.perfil
        };

        // Check if this fee matches any of the user's profiles
        const isUserFee = userProfiles?.some((userProfile) => {
          return userProfile.perfis.some(profile => 
            profile.nome === normalizedFee.perfil?.nome
          );
        });

        return {
          ...normalizedFee,
          isUserFee
        } as Fee;
      });

      console.log('Transformed fees:', transformedFees);
      return transformedFees;
    },
    enabled: !!eventId
  });
}
