import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { supabase } from '@/lib/supabase';
import { Loader2, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
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
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fromProfile = location.state?.fromProfile;
  console.log('Reset password page - from profile:', fromProfile);
  console.log('Reset password page - user:', user?.id);

  React.useEffect(() => {
    if (!fromProfile && !user) {
      console.log('Invalid access to reset password page');
      setError('Acesso inválido à página de redefinição de senha');
      navigate('/login');
    }
  }, [fromProfile, user, navigate]);

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const handleBackToProfile = () => {
    navigate('/athlete-profile');
  };

  const onSubmit = async (values: z.infer<typeof resetPasswordSchema>) => {
    try {
      setIsSubmitting(true);
      setError(null);
      console.log('Starting password update for user:', user?.id);

      // First verify the user is authenticated
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        console.error('No valid session found');
        setError('Sessão expirada. Por favor, faça login novamente.');
        navigate('/login');
        return;
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: values.password
      });

      if (updateError) {
        console.error('Password update error:', updateError);
        setError('Erro ao atualizar senha. Por favor, tente novamente.');
        return;
      }

      console.log('Password updated successfully');
      
      // Navigate first, then show the success message
      navigate('/athlete-profile');
      toast.success('Senha alterada com sucesso!');
      
    } catch (error) {
      console.error('Unexpected error:', error);
      setError('Erro inesperado. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-olimpics-background">
      <Card className="w-[400px] shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-olimpics-green-primary text-center">
            {fromProfile ? 'Alterar Senha' : 'Redefinir Senha'}
          </CardTitle>
          <CardDescription className="text-center text-olimpics-text">
            Digite sua nova senha
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <Lock className="h-12 w-12 text-olimpics-green-primary" />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

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
              <div className="space-y-2">
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
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleBackToProfile}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para o Perfil
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}