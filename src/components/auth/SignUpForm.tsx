
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from '@tanstack/react-query';
import { fetchBranches } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import InputMask from 'react-input-mask';
import { useNavigate } from 'react-router-dom';
import { validateCPF } from '@/utils/documentValidation';

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

      if (values.profile_type === 'Atleta') {
        const { error: paymentError } = await supabase
          .from('pagamentos')
          .insert([{
            atleta_id: userId,
            valor: 235.00,
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="profile_type"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>Tipo de Cadastro</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Atleta" id="atleta" />
                    <Label htmlFor="atleta">Atleta</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Público Geral" id="publico" />
                    <Label htmlFor="publico">Público Geral</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-left w-full">Nome Completo</FormLabel>
              <FormControl>
                <Input
                  placeholder="Seu nome completo"
                  className="border-olimpics-green-primary/20 focus-visible:ring-olimpics-green-primary"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-left w-full">Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  className="border-olimpics-green-primary/20 focus-visible:ring-olimpics-green-primary"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="telefone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-left w-full">Telefone com DDD</FormLabel>
              <FormControl>
                <InputMask
                  mask="(99) 99999-9999"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                >
                  {(inputProps: any) => (
                    <Input
                      {...inputProps}
                      type="tel"
                      placeholder="(XX) XXXXX-XXXX"
                      className="border-olimpics-green-primary/20 focus-visible:ring-olimpics-green-primary"
                    />
                  )}
                </InputMask>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="branchId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sede</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione sua Sede" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-left w-full">Senha</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••"
                  className="border-olimpics-green-primary/20 focus-visible:ring-olimpics-green-primary"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-left w-full">Confirmar Senha</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••"
                  className="border-olimpics-green-primary/20 focus-visible:ring-olimpics-green-primary"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tipo_documento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Documento</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de documento" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="CPF">CPF</SelectItem>
                  <SelectItem value="RG">RG</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="numero_documento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número do Documento</FormLabel>
              <FormControl>
                <InputMask
                  mask={form.getValues('tipo_documento') === 'CPF' ? "999.999.999-99" : "9999999999"}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                >
                  {(inputProps: any) => (
                    <Input
                      {...inputProps}
                      placeholder={form.getValues('tipo_documento') === 'CPF' ? "000.000.000-00" : "0000000000"}
                      className="border-olimpics-green-primary/20 focus-visible:ring-olimpics-green-primary"
                    />
                  )}
                </InputMask>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="genero"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Selecione o Gênero</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value || "Masculino"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o gênero" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Masculino">Masculino</SelectItem>
                  <SelectItem value="Feminino">Feminino</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">
          Após concluir seu cadastro, se ainda não tiver enviado o comprovante de pagamento, 
          você poderá fazê-lo na tela de perfil do atleta. A validação do pagamento será 
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

