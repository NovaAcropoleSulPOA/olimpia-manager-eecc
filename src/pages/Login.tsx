import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from '@tanstack/react-query';
import { fetchBranches } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import InputMask from 'react-input-mask';
import PaymentInfo from '@/components/PaymentInfo';
import { useNavigate } from 'react-router-dom';
import { validateCPF } from '@/utils/documentValidation';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

const registerSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  telefone: z.string().min(14, 'Telefone inválido').max(15),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string(),
  branchId: z.string({
    required_error: "Selecione uma filial",
  }),
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
      // Get the tipo_documento value from the form context
      const clean = val.replace(/\D/g, '');
      // Only validate CPF if the document type is CPF
      if (clean.length !== 11) return true; // Skip validation for non-CPF lengths
      return validateCPF(clean);
    }, 'CPF inválido'),
  genero: z.enum(['Masculino', 'Feminino', 'Prefiro não informar'], {
    required_error: "Selecione o gênero",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

const Login = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nome: '',
      email: '',
      telefone: '',
      password: '',
      confirmPassword: '',
      branchId: '',
      tipo_documento: 'CPF',
      numero_documento: '',
      genero: 'Prefiro não informar',
    },
  });

  // Fetch and sort branches
  const { data: branches = [], isLoading: isLoadingBranches, error: branchesError } = useQuery({
    queryKey: ['branches'],
    queryFn: fetchBranches,
    select: (data) => {
      console.log('Processing branches data:', data);
      return data ? [...data].sort((a, b) => a.nome.localeCompare(b.nome)) : [];
    }
  });

  console.log('Current branches state:', { branches, isLoadingBranches, branchesError });

  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      setIsSubmitting(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
  
      if (error) {
        console.error('Sign in error:', error);
  
        if (error.code === "invalid_credentials") {
          toast.error("E-mail não cadastrado. Verifique os dados ou realize o cadastro.");
          return;
        }
  
        if (error.code === "email_not_confirmed") {
          toast.error("Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada e clique no link de ativação antes de tentar fazer login.");
          return;
        }
  
        toast.error("Erro ao fazer login. Verifique suas credenciais.");
        return;
      }
  
      toast.success("Login realizado com sucesso!");
    } catch (error) {
      console.error("Unexpected Login Error:", error);
      toast.error("Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };  
  
  const onRegisterSubmit = async (values: z.infer<typeof registerSchema>) => {
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
  
      const { error: rolesError } = await supabase
        .from('papeis_usuarios')
        .insert([{
          usuario_id: userId,
          perfil_id: 1 // ID for "Atleta" role
        }]);
  
      if (rolesError) {
        console.error('Role assignment error:', rolesError);
        toast.error('Erro ao atribuir papel de atleta ao usuário.');
        return;
      }
  
      console.log('Athlete role assigned successfully');
  
      const { error: paymentError } = await supabase
        .from('pagamentos')
        .insert([{
          atleta_id: userId,
          valor: 180.00,
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
  
      toast.success('Cadastro realizado com sucesso! Verifique seu e-mail para ativação.');
      navigate('/');
  
    } catch (error) {
      console.error('Registration process error:', error);
      toast.error('Erro ao realizar cadastro. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };  
  
  const onForgotPasswordSubmit = async (values: z.infer<typeof forgotPasswordSchema>) => {
    try {
      setIsSubmitting(true);
      
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('id, email_confirmed_at')
        .eq('email', values.email)
        .single();
      
      if (userError || !userData) {
        toast.error('Email não encontrado. Valide o seu e-mail ou realize o cadastro.');
        return;
      }

      if (!userData.email_confirmed_at) {
        toast.error('Seu e-mail ainda não foi validado. Verifique seu e-mail e conclua a ativação antes de solicitar a recuperação de senha.');
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast.success('Email de recuperação de senha enviado com sucesso!');
      setShowForgotPassword(false);
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('Erro ao enviar email de recuperação de senha.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-olimpics-background">
      <div className="container mx-auto p-6">
        <Tabs defaultValue="register" className="w-full max-w-2xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 bg-olimpics-green-primary/10">
            <TabsTrigger 
              value="register"
              className="data-[state=active]:bg-olimpics-green-primary data-[state=active]:text-white"
            >
              Inscreva-se
            </TabsTrigger>
            <TabsTrigger 
              value="login"
              className="data-[state=active]:bg-olimpics-green-primary data-[state=active]:text-white"
            >
              Login
            </TabsTrigger>
          </TabsList>

          <TabsContent value="register" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
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
                      control={registerForm.control}
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
                      control={registerForm.control}
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
                      control={registerForm.control}
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
                      control={registerForm.control}
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
                      control={registerForm.control}
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
                      control={registerForm.control}
                      name="numero_documento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número do Documento</FormLabel>
                          <FormControl>
                            <InputMask
                              mask={registerForm.getValues('tipo_documento') === 'CPF' ? "999.999.999-99" : "9999999999"}
                              value={field.value}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                            >
                              {(inputProps: any) => (
                                <Input
                                  {...inputProps}
                                  placeholder={registerForm.getValues('tipo_documento') === 'CPF' ? "000.000.000-00" : "0000000000"}
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
                      control={registerForm.control}
                      name="genero"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gênero</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o gênero" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Masculino">Masculino</SelectItem>
                              <SelectItem value="Feminino">Feminino</SelectItem>
                              <SelectItem value="Prefiro não informar">Prefiro não informar</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <PaymentInfo />
                    <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">
                      Após completar seu cadastro, você receberá um email com instruções para enviar seu comprovante de pagamento. 
                      Por favor, siga as instruções no email para completar seu cadastro.
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-olimpics-green-primary hover:bg-olimpics-green-secondary text-white"
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="login" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
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
                      control={loginForm.control}
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
                    <Button
                      type="submit"
                      className="w-full bg-olimpics-green-primary hover:bg-olimpics-green-secondary text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Entrando...
                        </>
                      ) : (
                        'Entrar'
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <div className="mt-8 space-y-6">
              <Card>
                <CardContent className="p-6 space-y-6">
                  <h3 className="text-xl font-semibold mb-4 text-olimpics-text text-center">Citações Filosóficas</h3>
                  
                  <div className="space-y-6">
                    <div className="quote-item">
                      <h4 className="font-semibold text-olimpics-green-primary">Platão (428–348 a.C.)</h4>
                      <p className="text-olimpics-text mt-2 italic">
                        "O homem pode aprender virtudes e disciplina tanto na música quanto na ginástica, pois ambas moldam a alma e o corpo."
                      </p>
                      <p className="text-sm text-gray-600 mt-1">— Platão, A República (Livro III)</p>
                    </div>

                    <div className="quote-item">
                      <h4 className="font-semibold text-olimpics-green-primary">Aristóteles (384–322 a.C.)</h4>
                      <p className="text-olimpics-text mt-2 italic">
                        "Somos o que repetidamente fazemos. A excelência, portanto, não é um feito, mas um hábito."
                      </p>
                      <p className="text-sm text-gray-600 mt-1">— Aristóteles, Ética a Nicômaco</p>
                    </div>

                    <div className="quote-item">
                      <h4 className="font-semibold text-olimpics-green-primary">Epicteto (50–135 d.C.)</h4>
                      <p className="text-olimpics-text mt-2 italic">
                        "Se você quer vencer nos Jogos Olímpicos, deve se preparar, exercitar-se, comer moderadamente, suportar a fadiga e obedecer ao treinador."
                      </p>
                    </div>

                    <div className="quote-item">
                      <h4 className="font-semibold text-olimpics-green-primary">Sêneca (4 a.C.–65 d.C.)</h4>
                      <p className="text-olimpics-text mt-2 italic">
                        "A vida é como um gladiador nos jogos: não se trata apenas de sobreviver, mas de lutar bem."
                      </p>
                      <p className="text-sm text-gray-600 mt-1">— Sêneca, Cartas a Lucílio</p>
                    </div>

                    <div className="quote-item">
                      <h4 className="font-semibold text-olimpics-green-primary">Diógenes de Sinope (412–323 a.C.)</h4>
                      <p className="text-olimpics-text mt-2 italic">
                        "Os vencedores dos Jogos Olímpicos recebem apenas uma coroa de louros; mas os que vivem com virtude recebem a verdadeira glória."
                      </p>
                      <p className="text-sm text-gray-600 mt-1">— Diógenes, citado por Diógenes Laércio</p>
                    </div>

                    <div className="quote-item">
                      <h4 className="font-semibold text-olimpics-green-primary">Cícero (106–43 a.C.)</h4>
                      <p className="text-olimpics-text mt-2 italic">
                        "O esforço e a perseverança sempre superam o talento que não se disciplina."
                      </p>
                      <p className="text-sm text-gray-600 mt-1">— Cícero, De Officiis</p>
                    </div>

                    <div className="quote-item">
                      <h4 className="font-semibold text-olimpics-green-primary">Píndaro (518–438 a.C.)</h4>
                      <p className="text-olimpics-text mt-2 italic">
                        "Ó minha alma, não aspire à vida imortal, mas esgote o campo do possível."
                      </p>
                      <p className="text-sm text-gray-600 mt-1">(Não filósofo, mas poeta dos Jogos Olímpicos)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Login;

