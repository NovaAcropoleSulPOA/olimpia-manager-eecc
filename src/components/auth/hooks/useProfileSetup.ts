
import { supabase } from '@/lib/supabase';
import { DEFAULT_EVENT_ID } from '../utils/identifierUtils';
import { generateIdentifier } from '../utils/identifierUtils';
import { toast } from 'sonner';

export const useProfileSetup = () => {
  const setupProfile = async (userId: string) => {
    try {
      // Get profile type ID for 'Atleta' type
      const { data: profileTypeData, error: profileTypeError } = await supabase
        .from('perfis_tipo')
        .select('id')
        .eq('codigo', 'ATL')
        .single();

      if (profileTypeError || !profileTypeData) {
        throw new Error('Error getting profile type');
      }

      // Get profile ID for the event and profile type
      const { data: profileData, error: profileError } = await supabase
        .from('perfis')
        .select('id')
        .eq('evento_id', DEFAULT_EVENT_ID)
        .eq('perfil_tipo_id', profileTypeData.id)
        .single();

      if (profileError || !profileData) {
        throw new Error('Error getting profile');
      }

      // Assign role to user
      const { error: rolesError } = await supabase
        .from('papeis_usuarios')
        .insert([{
          usuario_id: userId,
          perfil_id: profileData.id,
          evento_id: DEFAULT_EVENT_ID
        }]);

      if (rolesError) {
        throw new Error('Error assigning role to user');
      }

      // Get registration fee
      const { data: feeData, error: feeError } = await supabase
        .from('taxas_inscricao')
        .select('valor')
        .eq('perfil_id', profileData.id)
        .eq('evento_id', DEFAULT_EVENT_ID)
        .single();

      if (feeError) {
        throw new Error('Error getting registration fee');
      }

      // Generate identifier and create payment record
      const identifier = await generateIdentifier();
      const { error: paymentError } = await supabase
        .from('pagamentos')
        .insert([{
          atleta_id: userId,
          evento_id: DEFAULT_EVENT_ID,
          valor: feeData.valor,
          status: 'pendente',
          comprovante_url: null,
          validado_sem_comprovante: false,
          data_validacao: null,
          data_criacao: new Date().toISOString(),
          numero_identificador: identifier
        }]);

      if (paymentError) {
        throw new Error('Error creating payment record');
      }

      return true;
    } catch (error) {
      console.error('Profile setup error:', error);
      return false;
    }
  };

  return { setupProfile };
};
