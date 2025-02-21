
import React from 'react';
import { Button } from '@/components/ui/button';
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { PersonalInfoSection } from './form-sections/PersonalInfoSection';
import { ContactSection } from './form-sections/ContactSection';
import { useDependentRegistration } from './hooks/useDependentRegistration';
import { dependentRegisterSchema, DependentRegisterFormData } from './types/form-types';

interface DependentRegistrationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const DependentRegistrationForm = ({ onSuccess, onCancel }: DependentRegistrationFormProps) => {
  const { isSubmitting, handleSubmit: onSubmit } = useDependentRegistration(onSuccess);

  const form = useForm<DependentRegisterFormData>({
    resolver: zodResolver(dependentRegisterSchema),
    defaultValues: {
      nome: '',
      ddi: '+55',
      telefone: '',
      branchId: undefined,
      tipo_documento: 'CPF',
      numero_documento: '',
      genero: 'Masculino',
      data_nascimento: undefined,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Este formulário é exclusivo para cadastro de dependentes até 12 anos de idade.
            Para maiores de 13 anos, utilize o cadastro padrão na página inicial.
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          <PersonalInfoSection form={form} />
          <ContactSection 
            form={form} 
            hideEmail
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cadastrando...
              </>
            ) : (
              'Cadastrar Dependente'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
