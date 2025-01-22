import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Award } from 'lucide-react';

interface Score {
  id: number;
  valor: number;
  modalidade: {
    id: number;
    nome: string;
    tipo_pontuacao: 'tempo' | 'distancia' | 'pontos';
  };
}

interface AthleteScoresProps {
  scores: Score[];
}

export default function AthleteScores({ scores }: AthleteScoresProps) {
  if (!scores || scores.length === 0) {
    return null;
  }

  const formatScore = (score: number, tipo: 'tempo' | 'distancia' | 'pontos') => {
    switch (tipo) {
      case 'tempo':
        return `${score.toFixed(2)}s`;
      case 'distancia':
        return `${score.toFixed(2)}m`;
      case 'pontos':
        return score.toString();
      default:
        return score.toString();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-olimpics-orange-primary" />
          Pontuações
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Modalidade</TableHead>
              <TableHead className="text-right">Pontuação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scores.map((score) => (
              <TableRow key={score.id}>
                <TableCell>{score.modalidade.nome}</TableCell>
                <TableCell className="text-right">
                  {formatScore(score.valor, score.modalidade.tipo_pontuacao)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}