import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: registration, isLoading } = useQuery({
    queryKey: ['registration', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inscricoes')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
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

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-olimpics-green-primary">
            Bem-vindo(a), {user?.nome}!
          </CardTitle>
          <CardDescription>
            Status da inscrição: {' '}
            <span className={`font-medium ${
              registration?.status === 'confirmado' ? 'text-green-600' :
              registration?.status === 'pendente' ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {registration?.status === 'confirmado' ? 'Confirmada' :
               registration?.status === 'pendente' ? 'Pendente' :
               'Cancelada'}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {registration?.status !== 'confirmado' ? (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <p className="text-yellow-700">
                Seu acesso está limitado até que sua inscrição seja aprovada. 
                Por favor, aguarde a confirmação da organização.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {user?.roleIds?.includes(1) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Painel do Atleta</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Acesse suas informações de competição</p>
                  </CardContent>
                </Card>
              )}
              {user?.roleIds?.includes(2) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Painel do Organizador</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Gerencie inscrições e pagamentos</p>
                  </CardContent>
                </Card>
              )}
              {user?.roleIds?.includes(3) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Painel do Juiz</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Submeta pontuações</p>
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