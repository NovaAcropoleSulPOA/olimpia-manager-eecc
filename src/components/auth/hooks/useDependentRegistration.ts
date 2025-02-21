
import { useState } from 'react';
import { toast } from "sonner";
import { DependentRegisterFormData } from '../types/form-types';
import { formatBirthDate } from '../utils/registrationUtils';
import { supabase } from '@/lib/supabase';
import { differenceInYears } from 'date-fns';

export const useDependentRegistration = (onSuccess?: () => void) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: DependentRegisterFormData) => {
    let toastId: string | number | undefined;
    
    try {
      console.log('[Dependent Registration] Starting process with values:', values);
      setIsSubmitting(true);
      toastId = toast.loading('Cadastrando dependente...');

      if (!values.data_nascimento) {
        throw new Error('Data de nascimento é obrigatória');
      }

      const formattedBirthDate = formatBirthDate(values.data_nascimento);
      if (!formattedBirthDate) {
        throw new Error('Data de nascimento inválida');
      }

      // Calculate age
      const age = differenceInYears(new Date(), values.data_nascimento);
      console.log('[Dependent Registration] Calculated age:', age);
      
      if (age >= 13) {
        throw new Error(
          'Apenas menores de 13 anos podem ser cadastrados como dependentes. ' +
          'Para maiores de 13 anos, utilize o cadastro padrão na página inicial.'
        );
      }

      // Get current user's ID
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user?.id) {
        throw new Error('Usuário não autenticado');
      }

      console.log('[Dependent Registration] Current user ID:', user.id);

      // Get current user's profile data
      const { data: parentUser, error: parentError } = await supabase
        .from('usuarios')
        .select('telefone, filial_id')
        .eq('id', user.id)
        .single();

      if (parentError) throw parentError;
      if (!parentUser) {
        throw new Error('Dados do usuário principal não encontrados');
      }

      console.log('[Dependent Registration] Parent user data:', parentUser);

      const eventId = localStorage.getItem('currentEventId');
      if (!eventId) {
        throw new Error('ID do evento não encontrado');
      }

      console.log('[Dependent Registration] Creating dependent user...');

      // Create the dependent user
      const { data: dependent, error: userCreationError } = await supabase
        .from('usuarios')
        .insert({
          nome_completo: values.nome,
          telefone: parentUser.telefone,
          filial_id: parentUser.filial_id,
          tipo_documento: values.tipo_documento,
          numero_documento: values.numero_documento.replace(/\D/g, ''),
          genero: values.genero,
          data_nascimento: formattedBirthDate,
          usuario_registrador_id: user.id,
          confirmado: true
        })
        .select()
        .single();

      if (userCreationError) {
        console.error('[Dependent Registration] Error creating user:', userCreationError);
        throw userCreationError;
      }

      if (!dependent) {
        throw new Error('Erro ao criar usuário dependente');
      }

      console.log('[Dependent Registration] Dependent user created:', dependent);

      try {
        // Process dependent registration (profiles and payment)
        const { error: registrationError } = await supabase
          .rpc('process_dependent_registration', {
            p_dependent_id: dependent.id,
            p_event_id: eventId,
            p_birth_date: formattedBirthDate
          });

        if (registrationError) {
          console.error('[Dependent Registration] Process registration error:', registrationError);
          throw registrationError;
        }

        console.log('[Dependent Registration] Registration processed successfully');
      } catch (processError) {
        console.error('[Dependent Registration] Process registration error:', processError);
        // Clean up the created user if registration process fails
        await supabase.from('usuarios').delete().eq('id', dependent.id);
        throw processError;
      }

      // Register modalities if any selected
      if (values.modalidades.length > 0) {
        console.log('[Dependent Registration] Registering modalities:', values.modalidades);
        
        try {
          const modalityRegistrations = values.modalidades.map(modalityId => ({
            atleta_id: dependent.id,
            modalidade_id: modalityId,
            evento_id: eventId,
            status: 'pendente',
            data_inscricao: new Date().toISOString()
          }));

          const { error: modalitiesError } = await supabase
            .from('inscricoes_modalidades')
            .insert(modalityRegistrations);

          if (modalitiesError) {
            console.error('[Dependent Registration] Modalities registration error:', modalitiesError);
            throw modalitiesError;
          }
        } catch (modalityError) {
          console.error('[Dependent Registration] Error registering modalities:', modalityError);
          // Don't throw here, as the main registration was successful
          toast.error('Algumas modalidades não puderam ser registradas');
        }
      }

      console.log('[Dependent Registration] Process completed successfully');
      toast.dismiss(toastId);
      toast.success('Dependente cadastrado com sucesso!');
      onSuccess?.();

    } catch (error: any) {
      console.error('[Dependent Registration] Error:', error);
      toast.dismiss(toastId);
      toast.error(error.message || 'Erro ao cadastrar dependente');
      setIsSubmitting(false);
    } finally {
      console.log('[Dependent Registration] Finalizing process');
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit
  };
};
