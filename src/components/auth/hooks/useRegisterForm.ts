
import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { supabase } from '@/lib/supabase';
import { RegisterFormData } from '../types/form-types';

const DEFAULT_EVENT_ID = 'e88fc492-9b35-49f9-a88e-5b7f65d10b2d'; // Default event ID

export const useRegisterForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values: RegisterFormData) => {
    try {
      console.log('Starting registration process with values:', values);
      setIsSubmitting(true);

      const { data: existingUser, error: checkError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', values.email)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing user:', checkError);
        toast.error('Erro ao verificar cadastro existente.');
        return;
      }

      if (existingUser) {
        toast.error("Este e-mail já está cadastrado. Por favor, faça login.");
        return;
      }

      // Format the phone number
      const cleanedPhoneNumber = values.telefone.replace(/\D/g, '');
      const fullPhoneNumber = `${values.ddi}${cleanedPhoneNumber}`;

      const signUpResult = await signUp({
        ...values,
        telefone: fullPhoneNumber,
        tipo_documento: values.tipo_documento,
        numero_documento: values.numero_documento.replace(/\D/g, ''),
        genero: values.genero,
        data_nascimento: values.data_nascimento,
      });

      if (signUpResult.error || !signUpResult.user) {
        console.error('Registration error:', signUpResult.error);
        toast.error('Erro ao realizar cadastro. Por favor, tente novamente.');
        return;
      }

      const userId = signUpResult.user.id;
      console.log(`User registered successfully with ID: ${userId}`);

      if (!userId) {
        toast.error("Erro ao obter ID do usuário.");
        return;
      }

      // Get profile type ID for 'Atleta' type
      const { data: profileTypeData, error: profileTypeError } = await supabase
        .from('perfis_tipo')
        .select('id')
        .eq('codigo', 'ATL')
        .single();

      if (profileTypeError || !profileTypeData) {
        console.error('Error getting profile type:', profileTypeError);
        toast.error('Erro ao obter tipo de perfil.');
        return;
      }

      // Get profile ID for the event and profile type
      const { data: profileData, error: profileError } = await supabase
        .from('perfis')
        .select('id')
        .eq('evento_id', DEFAULT_EVENT_ID)
        .eq('perfil_tipo_id', profileTypeData.id)
        .single();

      if (profileError || !profileData) {
        console.error('Error getting profile:', profileError);
        toast.error('Erro ao obter perfil.');
        return;
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
        console.error('Role assignment error:', rolesError);
        toast.error('Erro ao atribuir papel ao usuário.');
        return;
      }

      // Get registration fee for the profile type
      const { data: feeData, error: feeError } = await supabase
        .from('taxas_inscricao')
        .select('valor')
        .eq('perfil_id', profileData.id)
        .eq('evento_id', DEFAULT_EVENT_ID)
        .single();

      if (feeError) {
        console.error('Error getting registration fee:', feeError);
        toast.error('Erro ao obter valor da taxa de inscrição.');
        return;
      }

      // Generate unique identifier for this event registration
      const identifier = await generateIdentifier();

      // Create payment record
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
        console.error('Payment record creation error:', paymentError);
        toast.error('Erro ao criar registro de pagamento.');
        return;
      }

      toast.success('Cadastro realizado com sucesso!');
      navigate('/');

    } catch (error) {
      console.error('Registration process error:', error);
      toast.error('Erro ao realizar cadastro. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to generate a unique identifier
  const generateIdentifier = async (): Promise<string> => {
    const { count } = await supabase
      .from('pagamentos')
      .select('*', { count: 'exact', head: true })
      .eq('evento_id', DEFAULT_EVENT_ID);

    const nextNumber = (count || 0) + 1;
    return nextNumber.toString().padStart(3, '0');
  };

  return {
    isSubmitting,
    handleSubmit
  };
};
