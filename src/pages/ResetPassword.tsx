import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const resetPasswordSchema = z.object({
  password: z.string()
    .min(6, 'A senha deve ter no mínimo 6 caracteres')
    .max(50, 'A senha não pode ter mais de 50 caracteres'),
});

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const resetForm = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
    },
  });

  const requestForm = useForm<{ email: string }>({
    resolver: zodResolver(z.object({
      email: z.string().email('Email inválido'),
    })),
    defaultValues: {
      email: '',
    },
  });

  useEffect(() => {
    const token = searchParams.get('token');
    const type = searchParams.get('type');

    console.log('Checking reset parameters - Token:', !!token, 'Type:', type);

    if (token && type === 'recovery') {
      console.log('Valid reset token detected, enabling reset mode');
      setIsResetMode(true);
      setError(null);
    } else if (token || type) {
      console.error('Invalid reset parameters detected');
      setError('Link de redefinição inválido ou expirado. Por favor, solicite um novo.');
      setIsResetMode(false);
    }
  }, [searchParams]);

  const handleRequestReset = async (values: { email: string }) => {
    try {
      setIsSubmitting(true);
      console.log('Requesting password reset for:', values.email);

      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('Error requesting password reset:', error);
        throw error;
      }

      toast.success('Se este e-mail estiver cadastrado, você receberá um link para redefinir sua senha. NÃO ESQUEÇA DE VERIFICAR SUA CAIXA DE SPAM!');
      requestForm.reset();

    } catch (error) {
      console.error('Error in password reset request:', error);
      toast.error('Erro ao solicitar redefinição de senha. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async (values: z.infer<typeof resetPasswordSchema>) => {
    try {
      setIsSubmitting(true);
      console.log('Resetting password...');

      const { error } = await supabase.auth.updateUser({
        password: values.password
      });

      if (error) {
        console.error('Error resetting password:', error);
        throw error;
      }

      console.log('Password reset successful');
      toast.success('Senha redefinida com sucesso! Você será redirecionado para a página de login.');
      
      // Clear any auth session to ensure user needs to log in again
      await supabase.auth.signOut();
      
      // Redirect to login after successful password reset
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      console.error('Error in password reset:', error);
      toast.error('Erro ao redefinir senha. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-olimpics-background">
        <Card className="w-[400px] shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-olimpics-green-primary text-center">
              Erro na Redefinição
            </CardTitle>
            <CardDescription className="text-center text-olimpics-text">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => navigate('/')}
            >
              Voltar para a Tela Inicial
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isResetMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-olimpics-background">
        <Card className="w-[400px] shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-olimpics-green-primary text-center">
              Redefinir Senha
            </CardTitle>
            <CardDescription className="text-center text-olimpics-text">
              Digite sua nova senha abaixo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...resetForm}>
              <form onSubmit={resetForm.handleSubmit(handlePasswordReset)} className="space-y-4">
                <FormField
                  control={resetForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nova Senha</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••"
                            className="pr-10 border-olimpics-green-primary/20 focus-visible:ring-olimpics-green-primary"
                            {...field}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </Button>
                      </div>
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
                      Redefinindo...
                    </>
                  ) : (
                    'Redefinir Senha'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => navigate('/')}
                >
                  Voltar para a Tela Inicial
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-olimpics-background">
      <Card className="w-[400px] shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-olimpics-green-primary text-center">
            Recuperar Senha
          </CardTitle>
          <CardDescription className="text-center text-olimpics-text">
            Digite seu e-mail para receber o link de recuperação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...requestForm}>
            <form onSubmit={requestForm.handleSubmit(handleRequestReset)} className="space-y-4">
              <FormField
                control={requestForm.control}
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
                  'Enviar Link de Recuperação'
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => navigate('/')}
              >
                Voltar para a Tela Inicial
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}