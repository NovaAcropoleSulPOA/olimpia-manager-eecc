
import React from 'react';
import { Button } from '@/components/ui/button';
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PersonalInfoSection } from './form-sections/PersonalInfoSection';
import { ContactSection } from './form-sections/ContactSection';
import { useDependentRegistration } from './hooks/useDependentRegistration';
import { dependentRegisterSchema, DependentRegisterFormData } from './types/form-types';
import { Modality } from '@/types/modality';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface DependentRegistrationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const DependentRegistrationForm = ({ onSuccess, onCancel }: DependentRegistrationFormProps) => {
  // Fetch children's modalities
  const { data: modalities } = useQuery({
    queryKey: ['infantile-modalities'],
    queryFn: async () => {
      // Get current event ID from localStorage
      const eventId = localStorage.getItem('currentEventId');
      if (!eventId) throw new Error('No event selected');

      const { data, error } = await supabase
        .from('modalidades')
        .select('*')
        .eq('faixa_etaria', 'infantil')
        .eq('evento_id', eventId);

      if (error) throw error;
      return data as Modality[];
    },
  });

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
      modalidades: [],
    },
  });

  const { isSubmitting, handleSubmit: onSubmit } = useDependentRegistration(onSuccess);
  const selectedModalities = form.watch('modalidades');

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

          <Card>
            <CardHeader>
              <CardTitle>Modalidades Infantis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Selecione pelo menos uma modalidade infantil para o dependente.
                </AlertDescription>
              </Alert>

              <FormField
                control={form.control}
                name="modalidades"
                rules={{
                  required: 'Selecione pelo menos uma modalidade',
                  validate: (value) => 
                    value.length > 0 || 'Selecione pelo menos uma modalidade'
                }}
                render={() => (
                  <FormItem>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {modalities?.map((modality) => (
                        <FormField
                          key={modality.id}
                          control={form.control}
                          name="modalidades"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={modality.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(modality.id)}
                                    onCheckedChange={(checked) => {
                                      const updatedValue = checked
                                        ? [...field.value || [], modality.id]
                                        : field.value?.filter((id) => id !== modality.id) || [];
                                      field.onChange(updatedValue);
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {modality.nome}
                                  <p className="text-xs text-muted-foreground">
                                    {modality.tipo_modalidade} • {modality.categoria}
                                  </p>
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
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
            disabled={isSubmitting || selectedModalities.length === 0}
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
