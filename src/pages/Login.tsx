import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from '@tanstack/react-query';
import { fetchModalities, fetchBranches, fetchRoles } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import InputMask from 'react-input-mask';
import PaymentInfo from '@/components/PaymentInfo';
import { useNavigate } from 'react-router-dom';
import { validateCPF } from '@/utils/documentValidation';
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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
  tipo_documento: z.enum(['CPF', 'RG']),
  numero_documento: z.string().refine((val) => {
    const clean = val.replace(/\D/g, '');
    if (val.includes('CPF')) {
      return validateCPF(clean);
    }
    return clean.length >= 9; // RG validation (minimum length)
  }, {
    message: 'Documento inválido',
  }),
  branchId: z.string({
    required_error: "Selecione uma filial",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

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

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nome: '',
      email: '',
      telefone: '',
      password: '',
      confirmPassword: '',
      tipo_documento: 'CPF',
      numero_documento: '',
      branchId: '',
    },
  });

  const forgotPasswordForm = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const { data: modalities, isLoading: isLoadingModalities } = useQuery({
    queryKey: ['modalities'],
    queryFn: fetchModalities,
  });

  const { data: branches, isLoading: isLoadingBranches } = useQuery({
    queryKey: ['branches'],
    queryFn: fetchBranches,
  });

  const { data: roles, isLoading: isLoadingRoles } = useQuery({
    queryKey: ['roles'],
    queryFn: fetchRoles,
  });

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
          toast.error("Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.");
          return;
        }
        toast.error("Erro ao fazer login. Verifique suas credenciais.");
        return;
      }
  
      toast.success("Login realizado com sucesso!");
      navigate('/athlete-profile');
    } catch (error) {
      console.error("Unexpected Login Error:", error);
      toast.error("Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };  
  
  const onRegisterSubmit = async (values: RegisterFormData) => {
    try {
      console.log('Starting registration process with values:', values);
      setIsSubmitting(true);
  
      // Clean document number before saving
      const cleanDocumentNumber = values.numero_documento.replace(/\D/g, '');

      // Create user with default role as 'Atleta'
      const signUpResult = await signUp({
        ...values,
        telefone: values.telefone.replace(/\D/g, ''),
        numero_documento: cleanDocumentNumber,
      });
  
      if (signUpResult.error || !signUpResult.user) {
        console.error('Registration error:', signUpResult.error);
        toast.error('Erro ao realizar cadastro. Por favor, tente novamente.');
        setIsSubmitting(false);
        return;
      }
  
      const userId = signUpResult.user.id;
      console.log(`User registered successfully with ID: ${userId}`);
  
      if (!userId) {
        toast.error("Erro ao obter ID do usuário.");
        setIsSubmitting(false);
        return;
      }
  
      // Assign default Athlete role (ID: 1)
      const { error: rolesError } = await supabase
        .from('papeis_usuarios')
        .insert([{
          usuario_id: userId,
          perfil_id: 1 // Default to Athlete role
        }]);
  
      if (rolesError) {
        console.error('Role assignment error:', rolesError);
        toast.error('Erro ao atribuir os papéis do usuário.');
        setIsSubmitting(false);
        return;
      }
  
      console.log('User role assigned successfully');
  
      // Register payment for athlete
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
        setIsSubmitting(false);
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
      
      // Check if email exists and is confirmed using the usuarios table
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

  const philosophicalQuotes = [
    {
      author: "Platão (428–348 a.C.)",
      quote: "O homem pode aprender virtudes e disciplina tanto na música quanto na ginástica, pois ambas moldam a alma e o corpo.",
      source: "A República (Livro III)"
    },
    {
      author: "Aristóteles (384–322 a.C.)",
      quote: "Somos o que repetidamente fazemos. A excelência, portanto, não é um feito, mas um hábito.",
      source: "Ética a Nicômaco"
    },
    {
      author: "Epicteto (50–135 d.C.)",
      quote: "Se você quer vencer nos Jogos Olímpicos, deve se preparar, exercitar-se, comer moderadamente, suportar a fadiga e obedecer ao treinador."
    },
    {
      author: "Sêneca (4 a.C.–65 d.C.)",
      quote: "A vida é como um gladiador nos jogos: não se trata apenas de sobreviver, mas de lutar bem.",
      source: "Cartas a Lucílio"
    },
    {
      author: "Diógenes de Sinope (412–323 a.C.)",
      quote: "Os vencedores dos Jogos Olímpicos recebem apenas uma coroa de louros; mas os que vivem com virtude recebem a verdadeira glória.",
      source: "citado por Diógenes Laércio"
    },
    {
      author: "Cícero (106–43 a.C.)",
      quote: "O esforço e a perseverança sempre superam o talento que não se disciplina.",
      source: "De Officiis"
    },
    {
      author: "Píndaro (518–438 a.C.)",
      quote: "Ó minha alma, não aspire à vida imortal, mas esgote o campo do possível.",
      source: "Píticas III"
    }
  ];

  return (
    <div className="min-h-screen bg-olimpics-background">
      <div className="container mx-auto p-6">
        <Tabs defaultValue="register" className="w-full max-w-2xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 bg-olimpics-green-primary/10">
            <TabsTrigger value="register">Inscreva-se</TabsTrigger>
            <TabsTrigger value="login">Login</TabsTrigger>
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
                      name="tipo_documento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-left w-full">Tipo de Documento</FormLabel>
                          <Select 
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="border-olimpics-green-primary/20 focus-visible:ring-olimpics-green-primary">
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
                          <FormLabel className="text-left w-full">Número do Documento</FormLabel>
                          <FormControl>
                            <InputMask
                              mask={registerForm.watch("tipo_documento") === 'CPF' ? "999.999.999-99" : "999999999"}
                              value={field.value}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                            >
                              {(inputProps: any) => (
                                <Input
                                  {...inputProps}
                                  placeholder={registerForm.watch("tipo_documento") === 'CPF' ? "000.000.000-00" : "000000000"}
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
                      name="branchId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-left w-full">Filial</FormLabel>
                          <Select 
                            onValueChange={field.onChange}
                            value={field.value}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="border-olimpics-green-primary/20 focus-visible:ring-olimpics-green-primary">
                                <SelectValue placeholder="Selecione uma filial" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-[300px] overflow-y-auto">
                              {isLoadingBranches ? (
                                <SelectItem value="loading">Carregando...</SelectItem>
                              ) : (
                                branches?.map((branch) => (
                                  <SelectItem key={branch.id} value={branch.id}>
                                    <div className="flex flex-col">
                                      <span className="font-medium">{branch.nome}</span>
                                      <span className="text-sm text-gray-500">
                                        {branch.cidade} - {branch.estado}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))
                              )}
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
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4 text-olimpics-text">Pensamentos Filosóficos</h3>
                  <div className="space-y-4">
                    {philosophicalQuotes.map((quote, index) => (
                      <blockquote key={index} className="italic text-gray-600 border-l-4 border-olimpics-green-primary pl-4">
                        <p className="mb-2">{quote.quote}</p>
                        <footer className="text-sm">
                          <strong>{quote.author}</strong>
                          {quote.source && <span className="ml-1">— {quote.source}</span>}
                        </footer>
                      </blockquote>
                    ))}
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
