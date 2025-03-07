
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScoresTab } from '@/components/judge/tabs/ScoresTab';
import { TeamsTab } from '@/components/judge/tabs/TeamsTab';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';

export default function JudgeDashboard() {
  const { user, currentEventId } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('scores');

  // Check if the user has judge privileges
  const { data: isJudge, isLoading: isCheckingRole } = useQuery({
    queryKey: ['isJudge', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      const { data, error } = await supabase.rpc('is_judge', {
        user_id: user.id
      });
      
      if (error) {
        console.error('Error checking judge role:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível verificar suas permissões',
          variant: 'destructive'
        });
        return false;
      }
      
      return data;
    },
    enabled: !!user?.id,
  });

  // Redirect if not a judge
  React.useEffect(() => {
    if (!isCheckingRole && !isJudge && user) {
      toast({
        title: 'Acesso Negado',
        description: 'Você não tem permissão para acessar esta página',
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [isJudge, isCheckingRole, user, navigate, toast]);

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
          <ScoresTab userId={user.id} eventId={currentEventId} />
        </TabsContent>
        
        <TabsContent value="teams" className="mt-6">
          <TeamsTab userId={user.id} eventId={currentEventId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
