import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from '@/lib/supabase';
import { Loader2, Lock } from 'lucide-react';

const resetPasswordSchema = z.object({
  password: z.string()
    .min(6, 'A senha deve ter no mínimo 6 caracteres')
    .max(50, 'A senha deve ter no máximo 50 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Extract access_token from URL
  const searchParams = new URLSearchParams(location.search);
  const accessToken = searchParams.get('access_token');

  React.useEffect(() => {
    console.log('Checking access token on ResetPassword page');
    console.log('Current URL:', window.location.href);
    console.log('Access token present:', !!accessToken);
    
    if (!accessToken) {
      console.error('No access token found in URL');
      toast.error('Link de redefinição de senha inválido ou expirado');
      navigate('/forgot-password');
    }
  }, [accessToken, navigate]);

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof resetPasswordSchema>) => {
    try {
      setIsSubmitting(true);
      console.log('Attempting to update password');

      if (!accessToken) {
        console.error('No access token available');
        toast.error('Link de redefinição de senha inválido ou expirado');
        navigate('/forgot-password');
        return;
      }

      // Update the user's password using the access token
      const { error } = await supabase.auth.updateUser({
        password: values.password
      });

      if (error) {
        console.error('Password update error:', error);
        if (error.message.includes('Token expired')) {
          toast.error('O link de redefinição de senha expirou. Por favor, solicite um novo link.');
          navigate('/forgot-password');
        } else {
          toast.error('Erro ao atualizar senha. Por favor, tente novamente.');
        }
        return;
      }

      toast.success('Senha atualizada com sucesso!');
      navigate('/login');
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Erro ao processar solicitação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-olimpics-background">
      <Card className="w-[400px] shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-olimpics-green-primary text-center">
            Redefinir Senha
          </CardTitle>
          <CardDescription className="text-center text-olimpics-text">
            Digite sua nova senha
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <Lock className="h-12 w-12 text-olimpics-green-primary" />
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova Senha</FormLabel>
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
                    <FormLabel>Confirmar Nova Senha</FormLabel>
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
                className="w-full bg-olimpics-green-primary hover:bg-olimpics-green-secondary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  'Atualizar Senha'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}