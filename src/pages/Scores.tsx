
import React from 'react';
import { useAuth } from "@/contexts/AuthContext";
import AthleteScoresSection from '@/components/AthleteScoresSection';
import AthleteScores from '@/components/AthleteScores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export default function ScoresPage() {
  const { user } = useAuth();

  const { data: scores, isLoading, error } = useQuery({
    queryKey: ['athlete-individual-scores', user?.id],
    queryFn: async () => {
      console.log('Fetching individual scores for athlete:', user?.id);
      const { data, error } = await supabase
        .from('pontuacoes')
        .select(`
          id,
          valor,
          modalidade:modalidades (
            id,
            nome,
            tipo_pontuacao
          )
        `)
        .eq('atleta_id', user?.id);

      if (error) {
        console.error('Error fetching athlete scores:', error);
        throw error;
      }

      return data;
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-olimpics-green-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar as pontuações. Por favor, tente novamente mais tarde.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-olimpics-green-primary">
            Minhas Pontuações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {user?.id && <AthleteScoresSection athleteId={user.id} />}
          {scores && <AthleteScores scores={scores} />}
        </CardContent>
      </Card>
    </div>
  );
}
