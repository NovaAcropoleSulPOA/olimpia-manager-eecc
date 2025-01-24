import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from '@tanstack/react-query';
import { fetchModalities, fetchBranches, fetchRoles } from '@/lib/api';
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
  
        // Tratamento específico para erro de credenciais inválidas
        if (error.code === "invalid_credentials") {
          toast.error("E-mail não cadastrado. Verifique os dados ou realize o cadastro.");
          setIsSubmitting(false);
          return;
        }
  
        // Tratamento para e-mail não confirmado
        if (error.code === "email_not_confirmed") {
          toast.error("Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada e clique no link de ativação antes de tentar fazer login.");
          setIsSubmitting(false);
          return;
        }
  
        toast.error("Erro ao fazer login. Verifique suas credenciais.");
        setIsSubmitting(false);
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
  
      // Clean document number before saving
      const cleanDocumentNumber = values.numero_documento.replace(/\D/g, '');

      // Create user with default role as 'Atleta'
      const signUpResult = await signUp({
        ...values,
        telefone: values.telefone.replace(/\D/g, ''),
        numero_documento: cleanDocumentNumber,
        roleIds: [1] // 1 is the ID for 'Atleta'
      });
  
      if (signUpResult.error || !signUpResult.user) {
        console.error('Registration error:', signUpResult.error);
        toast.error('Erro ao realizar cadastro. Por favor, tente novamente.');
        setIsSubmitting(false);
        return;
      }
  
      const userId = signUpResult.user.id;
      console.log(`User registered successfully with ID: ${userId}`);
  
      // Se não houver ID de usuário, aborta o fluxo
      if (!userId) {
        toast.error("Erro ao obter ID do usuário.");
        setIsSubmitting(false);
        return;
      }
  
      // Cadastro dos papéis do usuário
      const { error: rolesError } = await supabase
        .from('papeis_usuarios')
        .insert(values.roleIds.map(roleId => ({
          usuario_id: userId,
          perfil_id: roleId
        })));
  
      if (rolesError) {
        console.error('Role assignment error:', rolesError);
        toast.error('Erro ao atribuir os papéis do usuário.');
        setIsSubmitting(false);
        return;
      }
  
      console.log('User roles assigned successfully');
  
      // Registro de pagamento se o usuário for atleta
      if (values.roleIds.includes(1)) {
        console.log(`Registering payment for user ID: ${userId}`);
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
      }
  
      // ✅ Mensagem de sucesso exibida **somente se tudo der certo**
      toast.success('Cadastro realizado com sucesso! Verifique seu e-mail para ativação.');
  
      // ✅ Redirecionamento para a aba de Login
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
                              mask={registerForm.watch("tipo_documento") === 'CPF' ? "999.999.999-99" : "99.999.999-9"}
                              value={field.value}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                            >
                              {(inputProps: any) => (
                                <Input
                                  {...inputProps}
                                  placeholder={registerForm.watch("tipo_documento") === 'CPF' ? "000.000.000-00" : "00.000.000-0"}
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

            {/* Mosaic and Video Section - Only visible in login tab */}
            <div className="mt-8 space-y-6">
              {/* Mosaic Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <img
                  src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81"
                  alt="Event participants"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <img
                  src="https://images.unsplash.com/photo-1519389950473-47ba0277781c"
                  alt="Collaboration"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <img
                  src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05"
                  alt="Achievement"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <img
                  src="https://images.unsplash.com/photo-1500375592092-40eb2168fd21"
                  alt="Inspiration"
                  className="w-full h-32 object-cover rounded-lg"
                />
              </div>

              {/* Video Section */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-xl font-semibold mb-4 text-olimpics-text">Conheça Nossos Eventos</h3>
                  <div className="relative w-full pt-[56.25%] rounded-lg overflow-hidden">
                    <iframe
                      src="https://www.youtube.com/embed/your-video-id"
                      title="Event Preview"
                      className="absolute top-0 left-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
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
