
import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { RegisterFormData } from '../types/form-types';
import { formatBirthDate, checkExistingUser, prepareUserMetadata } from '../utils/registrationUtils';
import { useProfileSetup } from './useProfileSetup';

export const useRegisterForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { setupProfile } = useProfileSetup();

  const handleSubmit = async (values: RegisterFormData) => {
    try {
      console.log('Starting registration process with values:', values);
      setIsSubmitting(true);

      // Validate birth date
      if (!values.data_nascimento) {
        console.error('Birth date is missing');
        toast.error('Data de nascimento é obrigatória');
        return;
      }

      // Format birth date
      const formattedBirthDate = formatBirthDate(values.data_nascimento);
      if (!formattedBirthDate) {
        toast.error('Data de nascimento inválida');
        return;
      }

      // Check for existing user
      const { data: existingUser, error: checkError } = await checkExistingUser(values.email);
      if (checkError) {
        console.error('Error checking existing user:', checkError);
        toast.error('Erro ao verificar cadastro existente.');
        return;
      }

      if (existingUser) {
        toast.error("Este e-mail já está cadastrado. Por favor, faça login.");
        return;
      }

      // Prepare and submit user data
      const userMetadata = prepareUserMetadata(values, formattedBirthDate);
      const signUpResult = await signUp({
        email: values.email,
        password: values.password,
        options: {
          data: userMetadata
        }
      });

      if (signUpResult.error) {
        console.error('Signup error details:', signUpResult.error);
        toast.error('Erro ao realizar cadastro. Por favor, tente novamente.');
        return;
      }

      if (!signUpResult.user) {
        console.error('No user returned from signup');
        toast.error('Erro ao criar usuário. Por favor, tente novamente.');
        return;
      }

      // Setup user profile and payment
      const profileSetupSuccess = await setupProfile(signUpResult.user.id);
      if (!profileSetupSuccess) {
        toast.error('Erro ao configurar perfil do usuário.');
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
