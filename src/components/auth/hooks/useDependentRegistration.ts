
import { useState } from 'react';
import { toast } from "sonner";
import { DependentRegisterFormData } from '../types/form-types';
import { formatBirthDate, formatPhoneNumber } from '../utils/registrationUtils';
import { supabase } from '@/lib/supabase';
import { differenceInYears } from 'date-fns';

export const useDependentRegistration = (onSuccess?: () => void) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: DependentRegisterFormData) => {
    try {
      setIsSubmitting(true);

      if (!values.data_nascimento) {
        toast.error('Data de nascimento é obrigatória');
        return;
      }

      const formattedBirthDate = formatBirthDate(values.data_nascimento);
      if (!formattedBirthDate) {
        toast.error('Data de nascimento inválida');
        return;
      }

      // Calculate age
      const age = differenceInYears(new Date(), values.data_nascimento);
      
      // Check if user is 13 or older
      if (age >= 13) {
        toast.error(
          'Apenas menores de 13 anos podem ser cadastrados como dependentes. ' +
          'Para maiores de 13 anos, utilize o cadastro padrão na página inicial.'
        );
        return;
      }

      // Get current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        toast.error('Erro ao obter informações do usuário');
        return;
      }

      // Insert dependent into usuarios table
      const { error } = await supabase
        .from('usuarios')
        .insert({
          nome_completo: values.nome,
          telefone: formatPhoneNumber(values.ddi, values.telefone),
          filial_id: values.branchId,
          tipo_documento: values.tipo_documento,
          numero_documento: values.numero_documento.replace(/\D/g, ''),
          genero: values.genero,
          data_nascimento: formattedBirthDate,
          usuario_registrador_id: user.id
        });

      if (error) {
        console.error('Error registering dependent:', error);
        toast.error('Erro ao cadastrar dependente');
        return;
      }

      toast.success('Dependente cadastrado com sucesso!');
      onSuccess?.();

    } catch (error) {
      console.error('Registration process error:', error);
      toast.error('Erro ao cadastrar dependente');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit
  };
};
