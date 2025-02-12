
import React from 'react';
import { Button } from '@/components/ui/button';
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { fetchBranches } from '@/lib/api';
import { PersonalInfoSection } from './form-sections/PersonalInfoSection';
import { ContactSection } from './form-sections/ContactSection';
import { AuthSection } from './form-sections/AuthSection';
import { ProfileTypeSection } from './form-sections/ProfileTypeSection';
import { registerSchema, RegisterFormData } from './types/form-types';
import { useRegisterForm } from './hooks/useRegisterForm';
import { EventSelection } from './EventSelection';

export const SignUpForm = () => {
  const { isSubmitting, handleSubmit: onSubmit } = useRegisterForm();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nome: '',
      email: '',
      ddi: '+55',
      telefone: '',
      password: '',
      confirmPassword: '',
      branchId: undefined,
      tipo_documento: 'CPF',
      numero_documento: '',
      genero: 'Masculino',
      profile_type: 'Atleta',
      eventos: [],
    },
  });

  const { data: branches = [], isLoading: isLoadingBranches } = useQuery({
    queryKey: ['branches'],
    queryFn: fetchBranches,
    select: (data) => {
      return data ? [...data].sort((a, b) => a.nome.localeCompare(b.nome)) : [];
    }
  });

  const selectedEvents = form.watch('eventos');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <ProfileTypeSection form={form} />
        
        <div className="space-y-6">
          <PersonalInfoSection form={form} />
          <ContactSection 
            form={form} 
            branches={branches} 
            isLoadingBranches={isLoadingBranches} 
          />
          <AuthSection form={form} />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Selecione os Eventos</h3>
          <EventSelection
            selectedEvents={selectedEvents}
            onEventSelect={(eventId) => {
              const currentEvents = form.getValues('eventos');
              if (currentEvents.includes(eventId)) {
                form.setValue(
                  'eventos', 
                  currentEvents.filter(id => id !== eventId)
                );
              } else {
                form.setValue('eventos', [...currentEvents, eventId]);
              }
            }}
            mode="registration"
          />
          {form.formState.errors.eventos && (
            <p className="text-sm text-red-500">
              {form.formState.errors.eventos.message}
            </p>
          )}
        </div>

        <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">
          Após concluir seu cadastro, se ainda não tiver enviado o comprovante de pagamento, 
          você poderá fazê-lo na tela de perfil. A validação do pagamento será 
          realizada pelos organizadores.
        </div>

        <Button
          type="submit"
          className="w-full bg-olimpics-green-primary hover:bg-olimpics-green-secondary text-white disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cadastrando...
            </>
          ) : (
            'Cadastrar'
          )}
        </Button>
      </form>
    </Form>
  );
};
