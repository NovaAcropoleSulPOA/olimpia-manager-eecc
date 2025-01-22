import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import PaymentInfo from '@/components/PaymentInfo';
import { useQuery } from '@tanstack/react-query';
import { fetchModalities, fetchBranches, fetchRoles } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import InputMask from 'react-input-mask';

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
  roleIds: z.array(z.number()).min(1, "Selecione pelo menos um perfil"),
  branchId: z.string({
    required_error: "Selecione uma filial",
  }),
  modalities: z.array(z.number()).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
}).refine(
  (data) => {
    if (data.roleIds.includes(1) && (!data.modalities || data.modalities.length === 0)) {
      return false;
    }
    return true;
  },
  {
    message: "Atletas devem selecionar pelo menos uma modalidade",
    path: ["modalities"],
  }
);

const Login = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { signIn, signUp } = useAuth();

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
      roleIds: [],
      branchId: '',
      modalities: [],
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
      await signIn(values.email, values.password);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRegisterSubmit = async (values: z.infer<typeof registerSchema>) => {
    try {
      console.log('Starting registration process with values:', values);
      setIsSubmitting(true);

      const signUpResult = await signUp({
        ...values,
        telefone: values.telefone.replace(/\D/g, ''), // Remove non-digits before saving
      });

      if (signUpResult.error) {
        console.error('Registration error:', signUpResult.error);
        toast.error('Erro ao realizar cadastro. Por favor, tente novamente.');
        return;
      }

      toast.success('Cadastro realizado com sucesso! Aguarde a confirmação do seu cadastro.');
      console.log('Registration successful:', signUpResult.user);
      
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

  const isAtletaSelected = registerForm.watch("roleIds").includes(1);

  return (
    <div className="min-h-screen flex items-center justify-center bg-olimpics-background">
      <Card className="w-[400px] shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-olimpics-green-primary text-center">
            Olimpíadas Estaduais RS 2025
          </CardTitle>
          <CardDescription className="text-center text-olimpics-text">
            {showForgotPassword ? "Recuperar senha" : "Faça login para continuar"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showForgotPassword ? (
            <Form {...forgotPasswordForm}>
              <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)} className="space-y-4">
                <FormField
                  control={forgotPasswordForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
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
                <div className="space-y-2">
                  <Button
                    type="submit"
                    className="w-full bg-olimpics-green-primary hover:bg-olimpics-green-secondary text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      'Enviar email de recuperação'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setShowForgotPassword(false)}
                  >
                    Voltar ao login
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-olimpics-green-primary/10">
                <TabsTrigger 
                  value="login"
                  className="data-[state=active]:bg-olimpics-green-primary data-[state=active]:text-white"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger 
                  value="register"
                  className="data-[state=active]:bg-olimpics-green-primary data-[state=active]:text-white"
                >
                  Cadastro
                </TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
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
                          <FormLabel>Senha</FormLabel>
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
                    <Button
                      type="button"
                      variant="link"
                      className="w-full text-olimpics-orange-primary hover:text-olimpics-orange-secondary"
                      onClick={() => setShowForgotPassword(true)}
                    >
                      Esqueceu sua senha?
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo</FormLabel>
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
                          <FormLabel>Email</FormLabel>
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
                          <FormLabel>Telefone com DDD</FormLabel>
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
                          <FormLabel>Senha</FormLabel>
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
                          <FormLabel>Confirmar Senha</FormLabel>
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
                          <FormLabel>Filial</FormLabel>
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
                            <SelectContent>
                              {isLoadingBranches ? (
                                <SelectItem value="loading">Carregando...</SelectItem>
                              ) : (
                                branches?.map((branch) => (
                                  <SelectItem key={branch.id} value={branch.id}>
                                    {branch.nome} - {branch.cidade}
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
                      name="roleIds"
                      render={() => (
                        <FormItem>
                          <FormLabel>Perfis</FormLabel>
                          <div className="grid grid-cols-2 gap-2">
                            {isLoadingRoles ? (
                              <div>Carregando perfis...</div>
                            ) : (
                              roles?.map((role) => (
                                <FormField
                                  key={role.id}
                                  control={registerForm.control}
                                  name="roleIds"
                                  render={({ field }) => {
                                    return (
                                      <FormItem
                                        key={role.id}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(role.id)}
                                            onCheckedChange={(checked) => {
                                              const updatedValue = checked
                                                ? [...(field.value || []), role.id]
                                                : field.value?.filter((value) => value !== role.id);
                                              field.onChange(updatedValue);
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                          {role.nome}
                                        </FormLabel>
                                      </FormItem>
                                    );
                                  }}
                                />
                              ))
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {isAtletaSelected && (
                      <FormField
                        control={registerForm.control}
                        name="modalities"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Modalidades</FormLabel>
                            <div className="grid grid-cols-1 gap-2">
                              {isLoadingModalities ? (
                                <div>Carregando modalidades...</div>
                              ) : (
                                modalities?.map((modality) => (
                                  <FormField
                                    key={modality.id}
                                    control={registerForm.control}
                                    name="modalities"
                                    render={({ field: modalityField }) => {
                                      return (
                                        <FormItem
                                          key={modality.id}
                                          className="flex flex-row items-start space-x-3 space-y-0 p-2 rounded-lg hover:bg-gray-50"
                                        >
                                          <FormControl>
                                            <Checkbox
                                              checked={modalityField.value?.includes(modality.id)}
                                              onCheckedChange={(checked) => {
                                                const updatedValue = checked
                                                  ? [...(modalityField.value || []), modality.id]
                                                  : modalityField.value?.filter((value) => value !== modality.id);
                                                modalityField.onChange(updatedValue);
                                              }}
                                            />
                                          </FormControl>
                                          <div className="flex flex-col">
                                            <FormLabel className="font-medium">
                                              {modality.nome}
                                            </FormLabel>
                                            <span className="text-sm text-gray-500">
                                              {modality.tipo_modalidade} • {modality.categoria}
                                            </span>
                                          </div>
                                        </FormItem>
                                      );
                                    }}
                                  />
                                ))
                              )}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

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
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
