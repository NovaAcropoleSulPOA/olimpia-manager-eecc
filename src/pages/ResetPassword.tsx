
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { supabase } from '@/lib/supabase';
import { AlertCircle, ArrowLeft, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const fromProfile = location.state?.fromProfile;

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  React.useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session check error:', sessionError);
          if (mounted) {
            setError('Erro ao verificar sessão');
            navigate('/login');
          }
          return;
        }

        if (!session && !fromProfile) {
          console.log('No session found, redirecting to login');
          if (mounted) {
            navigate('/login');
          }
        }
      } catch (err) {
        console.error('Session check failed:', err);
        if (mounted) {
          navigate('/login');
        }
      }
    };

    checkSession();
    return () => {
      mounted = false;
    };
  }, [navigate, fromProfile]);

  const handleBack = () => {
    if (fromProfile) {
      navigate('/athlete-profile');
    } else {
      navigate('/login');
    }
  };

  const onSubmit = async (values: z.infer<typeof resetPasswordSchema>) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      console.log('Starting password update process...');
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Erro ao verificar sessão. Por favor, faça login novamente.');
      }

      if (!session?.access_token) {
        console.error('No valid session found');
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: values.password
      });

      if (updateError) {
        console.error('Password update error:', updateError);
        if (updateError.message?.includes('same_password')) {
          throw new Error('Nova senha deve ser diferente da antiga.');
        }
        throw new Error(updateError.message || 'Erro ao atualizar senha');
      }

      console.log('Password updated successfully');
      
      toast.success('Senha alterada com sucesso!', {
        duration: 2000,
        onDismiss: () => {
          navigate('/athlete-profile', { replace: true });
        }
      });
      
    } catch (error: any) {
      console.error('Password update failed:', error);
      setError(error?.message || 'Erro ao atualizar senha. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Lock className="h-8 w-8 text-olimpics-green-primary" />
          <h1 className="text-2xl font-bold">
            {fromProfile ? 'Alterar Senha' : 'Redefinir Senha'}
          </h1>
          <p className="text-sm text-muted-foreground">
            Digite sua nova senha abaixo
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
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
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-olimpics-green-primary hover:bg-olimpics-green-secondary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Atualizando...' : 'Atualizar Senha'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="w-full"
                disabled={isSubmitting}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
