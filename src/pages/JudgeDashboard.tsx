
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export default function JudgeDashboard() {
  const { user, currentEventId } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('scores');

  // Check if the user has judge privileges
  const { data: isJudge, isLoading: isCheckingRole } = useQuery({
    queryKey: ['isJudge', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      // Check if user has the judge role (JUZ)
      const hasJudgeRole = user.papeis?.some(role => role.codigo === 'JUZ') || false;
      
      if (!hasJudgeRole) {
        return false;
      }
      
      return true;
    },
    enabled: !!user?.id,
  });

  // Redirect if not a judge
  React.useEffect(() => {
    if (!isCheckingRole && !isJudge && user) {
      toast.error('Você não tem permissão para acessar esta página');
      navigate('/');
    }
  }, [isJudge, isCheckingRole, user, navigate]);

  if (isCheckingRole) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Painel do Juiz</h1>
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!isJudge || !user) {
    return null; // Will redirect in the useEffect
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Painel do Juiz</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="scores">Pontuações</TabsTrigger>
          <TabsTrigger value="teams">Equipes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="scores" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Registrar Pontuações</CardTitle>
              <CardDescription>
                Registre pontuações para as modalidades e atletas sob sua responsabilidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Selecione uma modalidade e um atleta para registrar pontuações
              </p>
              {/* We'll implement the detailed score registration UI in a future update */}
              <div className="mt-4">
                <Button disabled>
                  Funcionalidade em desenvolvimento
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="teams" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Formação de Equipes</CardTitle>
              <CardDescription>
                Organize equipes para as modalidades coletivas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Selecione uma modalidade para gerenciar equipes
              </p>
              {/* We'll implement the detailed team formation UI in a future update */}
              <div className="mt-4">
                <Button disabled>
                  Funcionalidade em desenvolvimento
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
