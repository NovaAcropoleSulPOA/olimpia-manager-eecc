import { BranchAnalytics } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ModalitiesTableProps {
  data: BranchAnalytics[];
}

interface ModalityEntry {
  filial: string;
  modalidade: string;
  total: number;
}

export function ModalitiesTable({ data }: ModalitiesTableProps) {
  // Transform data for the table
  const tableData = data.reduce((acc: ModalityEntry[], branch) => {
    if (!branch.modalidades_populares) return acc;

    Object.entries(branch.modalidades_populares as Record<string, {
      Masculino?: number;
      Feminino?: number;
      Misto?: number;
    }>).forEach(([modalidade, categorias]) => {
      const total = (categorias.Masculino || 0) + 
                   (categorias.Feminino || 0) + 
                   (categorias.Misto || 0);
      
      acc.push({
        filial: branch.filial,
        modalidade,
        total
      });
    });
    return acc;
  }, []).sort((a, b) => b.total - a.total);

  console.log("Modalities table data:", tableData);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-olimpics-text">Inscrições por Modalidade e Filial</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Filial</TableHead>
                <TableHead>Modalidade</TableHead>
                <TableHead className="text-right">Total de Inscritos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((entry, index) => (
                <TableRow key={`${entry.filial}-${entry.modalidade}-${index}`}>
                  <TableCell>{entry.filial}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-olimpics-green-primary/10">
                      {entry.modalidade}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {entry.total}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}