import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, User } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: registration, isLoading } = useQuery({
    queryKey: ['registration', user?.id],
    queryFn: async () => {
      console.log('Fetching user registration details');
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching registration:', error);
        throw error;
      }
      
      console.log('Fetched registration details:', data);
      return data;
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-olimpics-green-primary" />
      </div>
    );
  }

  const isConfirmed = registration?.confirmado;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <User className="h-6 w-6 text-olimpics-green-primary" />
            <CardTitle className="text-2xl font-bold text-olimpics-green-primary">
              Bem-vindo(a), {user?.nome_completo}!
            </CardTitle>
          </div>
          <CardDescription>
            Status da inscrição: {' '}
            <span className={`font-medium ${
              isConfirmed ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {isConfirmed ? 'Confirmada' : 'Pendente'}
            </span>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!isConfirmed ? (
            <Alert variant="warning" className="bg-yellow-50 border-yellow-400">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertTitle>Acesso Limitado</AlertTitle>
              <AlertDescription>
                Seu acesso está limitado até que sua inscrição seja aprovada. 
                Por favor, aguarde a confirmação da organização.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="success" className="bg-green-50 border-green-400">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle>Inscrição Confirmada</AlertTitle>
              <AlertDescription>
                Sua inscrição foi aprovada. Você tem acesso completo ao sistema.
              </AlertDescription>
            </Alert>
          )}

          <Separator className="my-6" />

          {isConfirmed && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {user?.roleIds?.includes(1) && (
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">Painel do Atleta</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">Acesse suas informações de competição</p>
                    <Button 
                      variant="default" 
                      className="w-full bg-olimpics-green-primary hover:bg-olimpics-green-secondary"
                      onClick={() => navigate('/athlete')}
                    >
                      Acessar
                    </Button>
                  </CardContent>
                </Card>
              )}
              
              {user?.roleIds?.includes(2) && (
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">Painel do Organizador</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">Gerencie inscrições e pagamentos</p>
                    <Button 
                      variant="default" 
                      className="w-full bg-olimpics-orange-primary hover:bg-olimpics-orange-secondary"
                      onClick={() => navigate('/organizer')}
                    >
                      Acessar
                    </Button>
                  </CardContent>
                </Card>
              )}
              
              {user?.roleIds?.includes(3) && (
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">Painel do Juiz</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">Submeta pontuações</p>
                    <Button 
                      variant="default" 
                      className="w-full bg-olimpics-orange-primary hover:bg-olimpics-orange-secondary"
                      onClick={() => navigate('/judge')}
                    >
                      Acessar
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;