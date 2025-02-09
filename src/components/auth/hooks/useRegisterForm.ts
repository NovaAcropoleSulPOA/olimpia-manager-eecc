
import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { supabase } from '@/lib/supabase';
import { RegisterFormData } from '../types/form-types';

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

      // Format the phone number by concatenating DDI with the cleaned number
      const cleanedPhoneNumber = values.telefone.replace(/\D/g, '');
      const fullPhoneNumber = `${values.ddi}${cleanedPhoneNumber}`;

      const signUpResult = await signUp({
        ...values,
        telefone: fullPhoneNumber,
        tipo_documento: values.tipo_documento,
        numero_documento: values.numero_documento.replace(/\D/g, ''),
        genero: values.genero,
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

      // Get profile ID and registration fee
      const { data: profileData, error: profileError } = await supabase
        .from('perfis')
        .select('id')
        .eq('nome', values.profile_type)
        .single();

      if (profileError || !profileData) {
        console.error('Error getting profile ID:', profileError);
        toast.error('Erro ao atribuir perfil ao usuário.');
        return;
      }

      // Assign role to user
      const { error: rolesError } = await supabase
        .from('papeis_usuarios')
        .insert([{
          usuario_id: userId,
          perfil_id: profileData.id
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
        .single();

      if (feeError) {
        console.error('Error getting registration fee:', feeError);
        toast.error('Erro ao obter valor da taxa de inscrição.');
        return;
      }

      // Create payment record
      const { error: paymentError } = await supabase
        .from('pagamentos')
        .insert([{
          atleta_id: userId,
          valor: feeData.valor,
          status: 'pendente',
          comprovante_url: null,
          validado_sem_comprovante: false,
          data_validacao: null,
          data_criacao: new Date().toISOString()
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

  return {
    isSubmitting,
    handleSubmit
  };
};
