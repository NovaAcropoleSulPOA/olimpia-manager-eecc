import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Link, useNavigate } from 'react-router-dom';
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
}).refine((data) => {
  if (data.profile_type === 'Atleta' && !data.branchId) {
    return false;
  }
  return true;
}, {
  message: "Sede é obrigatória para Atletas",
  path: ["branchId"],
});

export default function Login() {
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      genero: 'Masculino',
      profile_type: 'Atleta',
    },
  });

  const { data: branches = [], isLoading: isLoadingBranches, error: branchesError } = useQuery({
    queryKey: ['branches'],
    queryFn: fetchBranches,
    select: (data) => {
      console.log('Processing branches data:', data);
      return data ? [...data].sort((a, b) => a.nome.localeCompare(b.nome)) : [];
    }
  });

  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      setIsSubmitting(true);
      await signIn(values.email, values.password);
      // Não é necessário exibir toast.success ou chamar navigate('/')
      // pois isso já é feito dentro do AuthContext.signIn
    } catch (error) {
      console.error("Login Error:", error);
      // Caso ocorra um erro inesperado (apesar do tratamento no AuthContext)
      toast.error("Erro ao fazer login. Verifique suas credenciais.");
    } finally {
      setIsSubmitting(false);
    }
  };  

  const onRegisterSubmit = async (values: z.infer<typeof registerSchema>) => {
    try {
      console.log('Starting registration process with values:', values);
      setIsSubmitting(true);

      if (values.profile_type === 'Atleta' && !values.branchId) {
        toast.error('Por favor, selecione uma Sede.');
        return;
      }

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
            valor: 230.00,
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

      registerForm.reset();
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
                      name="profile_type"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel>Tipo de Perfil</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Atleta" id="atleta" />
                                <Label htmlFor="atleta">Sou Atleta</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Público Geral" id="publico" />
                                <Label htmlFor="publico">Sou Público Geral</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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

                    {registerForm.watch('profile_type') === 'Atleta' && (
                      <FormField
                        control={registerForm.control}
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
                    )}

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
                    <div className="text-center">
                      <Link
                        to="/forgot-password"
                        className="text-olimpics-green-primary hover:text-olimpics-green-secondary text-sm"
                      >
                        Esqueceu sua senha?
                      </Link>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <div className="mt-8 space-y-6">
              <Card>
                <CardContent className="p-6 space-y-6">
                 
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
                      <p className="text-sm text-gray-600 mt-1">— Enchirídion" (ou "Manual")</p>
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
}
