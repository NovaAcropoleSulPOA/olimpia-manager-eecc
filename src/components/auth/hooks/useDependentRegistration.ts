
import { useState } from 'react';
import { toast } from "sonner";
import { DependentRegisterFormData } from '../types/form-types';
import { formatBirthDate } from '../utils/registrationUtils';
import { supabase } from '@/lib/supabase';
import { differenceInYears } from 'date-fns';

export const useDependentRegistration = (onSuccess?: () => void) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: DependentRegisterFormData) => {
    console.log('Starting dependent registration process:', values);
    
    try {
      setIsSubmitting(true);

      if (!values.data_nascimento) {
        toast.error('Data de nascimento é obrigatória');
        setIsSubmitting(false);
        return;
      }

      const formattedBirthDate = formatBirthDate(values.data_nascimento);
      if (!formattedBirthDate) {
        toast.error('Data de nascimento inválida');
        setIsSubmitting(false);
        return;
      }

      // Calculate age
      const age = differenceInYears(new Date(), values.data_nascimento);
      console.log('Calculated age:', age);
      
      // Check if user is 13 or older
      if (age >= 13) {
        toast.error(
          'Apenas menores de 13 anos podem ser cadastrados como dependentes. ' +
          'Para maiores de 13 anos, utilize o cadastro padrão na página inicial.'
        );
        setIsSubmitting(false);
        return;
      }

      // Get current user's ID and event ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        toast.error('Erro ao obter informações do usuário');
        setIsSubmitting(false);
        return;
      }

      // Get current user's profile data
      const { data: parentUser, error: parentError } = await supabase
        .from('usuarios')
        .select('telefone, filial_id')
        .eq('id', user.id)
        .single();

      if (parentError || !parentUser) {
        console.error('Error fetching parent user data:', parentError);
        toast.error('Erro ao obter informações do usuário principal');
        setIsSubmitting(false);
        return;
      }

      const eventId = localStorage.getItem('currentEventId');
      if (!eventId) {
        toast.error('Erro ao obter informações do evento');
        setIsSubmitting(false);
        return;
      }

      console.log('Creating dependent user with data:', {
        nome: values.nome,
        telefone: parentUser.telefone,
        filial_id: parentUser.filial_id,
        documento: values.numero_documento,
        genero: values.genero,
        data_nascimento: formattedBirthDate
      });

      // Create the dependent user first
      const { data: dependent, error: userError } = await supabase
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

      if (userError) {
        console.error('Error registering dependent:', userError);
        toast.error('Erro ao cadastrar dependente');
        setIsSubmitting(false);
        return;
      }

      console.log('Dependent user created successfully:', dependent);

      // Process dependent registration (profiles and payment)
      const { error: registrationError } = await supabase
        .rpc('process_dependent_registration', {
          p_dependent_id: dependent.id,
          p_event_id: eventId,
          p_birth_date: formattedBirthDate
        });

      if (registrationError) {
        console.error('Error processing registration:', registrationError);
        toast.error('Erro ao processar registro do dependente');
        setIsSubmitting(false);
        return;
      }

      console.log('Processing modality registrations:', values.modalidades);

      // Register the dependent in the selected modalities
      if (values.modalidades.length > 0) {
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
          console.error('Error registering modalities:', modalitiesError);
          toast.error('Erro ao cadastrar modalidades');
          setIsSubmitting(false);
          return;
        }
      }

      console.log('Registration process completed successfully');
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
