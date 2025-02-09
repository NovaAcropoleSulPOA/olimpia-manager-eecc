
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from '@tanstack/react-query';
import { fetchBranches } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { validateCPF } from '@/utils/documentValidation';
import { PersonalInfoSection } from './form-sections/PersonalInfoSection';
import { ContactSection } from './form-sections/ContactSection';
import { AuthSection } from './form-sections/AuthSection';
import { ProfileTypeSection } from './form-sections/ProfileTypeSection';

const registerSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  telefone: z.string().min(14, 'Telefone inválido').max(15),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string(),
  branchId: z.string().uuid('Sede inválida').optional(),
  tipo_documento: z.enum(['CPF', 'RG'], {
    required_error: "Selecione o tipo de documento",
  }),
  numero_documento: z.string()
    .min(1, 'Número do documento é obrigatório')
    .refine((val) => {
      if (!val) return false;
      const clean = val.replace(/\D/g, '');
      return clean.length >= 9;
    }, 'Documento inválido')
    .refine((val) => {
      const clean = val.replace(/\D/g, '');
      if (clean.length !== 11) return true;
      return validateCPF(clean);
    }, 'CPF inválido'),
  genero: z.enum(['Masculino', 'Feminino'], {
    required_error: "Selecione o gênero",
  }),
  profile_type: z.enum(['Atleta', 'Público Geral'], {
    required_error: "Selecione o tipo de perfil",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export const SignUpForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nome: '',
      email: '',
      telefone: '',
      password: '',
      confirmPassword: '',
      branchId: undefined,
      tipo_documento: 'CPF',
      numero_documento: '',
      genero: 'Masculino',
      profile_type: 'Atleta',
    },
  });

  const { data: branches = [], isLoading: isLoadingBranches } = useQuery({
    queryKey: ['branches'],
    queryFn: fetchBranches,
    select: (data) => {
      return data ? [...data].sort((a, b) => a.nome.localeCompare(b.nome)) : [];
    }
  });

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
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

      const signUpResult = await signUp({
        ...values,
        telefone: values.telefone.replace(/\D/g, ''),
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

      form.reset();
      toast.success('Cadastro realizado com sucesso!');
      navigate('/');

    } catch (error) {
      console.error('Registration process error:', error);
      toast.error('Erro ao realizar cadastro. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
