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

  // Extract token and type from URL
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token');
  const type = searchParams.get('type');

  React.useEffect(() => {
    console.log('Checking recovery parameters on ResetPassword page');
    console.log('Current URL:', window.location.href);
    console.log('Token present:', !!token);
    console.log('Type:', type);
    
    if (!token || type !== 'recovery') {
      console.error('Invalid recovery parameters');
      toast.error('Link de redefinição de senha inválido ou expirado');
      navigate('/forgot-password');
      return;
    }
  }, [token, type, navigate]);

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
      console.log('Attempting to reset password with recovery token');

      if (!token || type !== 'recovery') {
        console.error('Invalid recovery parameters during submission');
        toast.error('Link de redefinição de senha inválido ou expirado');
        navigate('/forgot-password');
        return;
      }

      // Exchange recovery token for session
      const { error: sessionError } = await supabase.auth.exchangeCodeForSession(token);
      
      if (sessionError) {
        console.error('Session creation error:', sessionError);
        if (sessionError.message.includes('expired')) {
          toast.error('Link expirado. Solicite um novo.');
        } else {
          toast.error('Link inválido');
        }
        navigate('/forgot-password');
        return;
      }

      // Update password using the new session
      const { error } = await supabase.auth.updateUser({
        password: values.password
      });

      if (error) {
        console.error('Password update error:', error);
        toast.error('Erro ao atualizar senha. Tente novamente.');
        return;
      }

      toast.success('Senha atualizada com sucesso!');
      navigate('/login');
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Erro inesperado. Tente novamente.');
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