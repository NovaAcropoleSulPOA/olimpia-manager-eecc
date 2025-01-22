import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import PaymentInfo from '@/components/PaymentInfo';
import { useQuery } from '@tanstack/react-query';
import { fetchModalities, fetchBranches, fetchRoles } from '@/lib/api';
import { supabase } from '@/lib/supabase';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
});

const registerSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string(),
  roleIds: z.array(z.number()).min(1, "Selecione pelo menos um perfil"),
  branchId: z.string({
    required_error: "Selecione uma filial",
  }),
  modalities: z.array(z.number()).optional(),
  paymentProof: z
    .any()
    .refine((file) => file?.size <= MAX_FILE_SIZE, "Arquivo deve ter no máximo 5MB")
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      "Somente arquivos .jpg, .jpeg, .png são aceitos"
    )
    .refine((file) => file !== null && file !== undefined, "Comprovante de pagamento é obrigatório"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

const Login = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, signUp } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
      password: '',
      confirmPassword: '',
      roleIds: [],
      branchId: '',
      modalities: [],
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

      if (!selectedFile) {
        toast.error('Por favor, anexe o comprovante de pagamento.');
        return;
      }

      // Upload payment proof
      console.log('Uploading payment proof');
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data: fileData, error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, selectedFile);

      if (uploadError) {
        console.error('Error uploading payment proof:', uploadError);
        toast.error('Erro ao fazer upload do comprovante de pagamento.');
        return;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName);
        
      const paymentProofUrl = publicUrl;
      console.log('Payment proof uploaded successfully:', paymentProofUrl);

      // Register user with Supabase Auth and create profile
      const signUpResult = await signUp({ 
        ...values,
        paymentProof: paymentProofUrl,
        roleIds: values.roleIds.map(id => Number(id))
      });

      if (signUpResult.error) {
        console.error('Registration error:', signUpResult.error);
        toast.error('Erro ao realizar cadastro. Por favor, tente novamente.');
        return;
      }

      // Success message is handled by AuthContext
      console.log('Registration successful:', signUpResult.user);
      
    } catch (error) {
      console.error('Registration process error:', error);
      toast.error('Erro ao realizar cadastro. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      toast.error("Por favor, selecione um arquivo");
      return;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Arquivo deve ter no máximo 5MB");
      return;
    }
    
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Somente arquivos .jpg, .jpeg, .png são aceitos");
      return;
    }
    
    setSelectedFile(file);
    registerForm.setValue('paymentProof', file);
    toast.success('Comprovante carregado com sucesso!');
  };

  // Check if Atleta role is selected
  const isAtletaSelected = registerForm.watch("roleIds").includes(1); // Assuming 1 is the ID for "Atleta"

  return (
    <div className="min-h-screen flex items-center justify-center bg-olimpics-background">
      <Card className="w-[400px] shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-olimpics-green-primary text-center">
            Olimpíadas Estaduais RS 2025
          </CardTitle>
          <CardDescription className="text-center text-olimpics-text">
            Faça login para continuar
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                  <FormField
                    control={registerForm.control}
                    name="paymentProof"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Comprovante de Pagamento (Obrigatório)</FormLabel>
                        <FormControl>
                          <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-olimpics-green-primary/20 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-4 text-olimpics-green-primary" />
                                <p className="mb-2 text-sm text-olimpics-text">
                                  <span className="font-semibold">Clique para enviar</span> ou arraste e solte
                                </p>
                                <p className="text-xs text-olimpics-text">
                                  PNG ou JPG (MAX. 5MB)
                                </p>
                              </div>
                              <Input
                                type="file"
                                className="hidden"
                                accept=".png,.jpg,.jpeg"
                                onChange={handleFileChange}
                              />
                            </label>
                          </div>
                        </FormControl>
                        {selectedFile && (
                          <p className="text-sm text-olimpics-green-primary mt-2">
                            Arquivo selecionado: {selectedFile.name}
                          </p>
                        )}
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
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            variant="link"
            onClick={() => console.log('Implementar recuperação de senha')}
            className="text-olimpics-orange-primary hover:text-olimpics-orange-secondary"
          >
            Esqueceu sua senha?
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
