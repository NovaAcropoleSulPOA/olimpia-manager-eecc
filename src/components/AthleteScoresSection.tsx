import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AthleteScore {
  atleta_id: string;
  modalidade_nome: string;
  pontuacao_total: number;
  media_pontuacao: number;
}

interface AthleteScoresSectionProps {
  athleteId: string;
}

export default function AthleteScoresSection({ athleteId }: AthleteScoresSectionProps) {
  const { data: scores, isLoading } = useQuery({
    queryKey: ['athlete-scores', athleteId],
    queryFn: async () => {
      console.log('Fetching athlete scores for:', athleteId);
      const { data, error } = await supabase
        .from('vw_pontuacoes_gerais_atletas')
        .select('*')
        .eq('atleta_id', athleteId);

      if (error) {
        console.error('Error fetching athlete scores:', error);
        throw error;
      }

      return data as AthleteScore[];
    },
    enabled: !!athleteId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-olimpics-green-primary" />
      </div>
    );
  }

  if (!scores?.length) {
    return (
      <Alert variant="default" className="bg-yellow-50 border-yellow-200">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertDescription>
          Ainda não há registros de pontuação disponíveis.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-olimpics-green-primary">
          <Trophy className="h-5 w-5" />
          Desempenho nas Modalidades
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Modalidade</TableHead>
              <TableHead className="text-right">Pontuação Total</TableHead>
              <TableHead className="text-right">Média</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scores.map((score, index) => (
              <TableRow key={`${score.modalidade_nome}-${index}`}>
                <TableCell className="font-medium">{score.modalidade_nome}</TableCell>
                <TableCell className="text-right">{score.pontuacao_total}</TableCell>
                <TableCell className="text-right">
                  {score.media_pontuacao.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}