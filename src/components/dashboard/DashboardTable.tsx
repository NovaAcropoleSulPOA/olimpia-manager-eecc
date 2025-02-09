import { useState } from "react";
import { BranchAnalytics } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpDown, Search, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DashboardTableProps {
  data: BranchAnalytics[];
}

interface ModalityData {
  [key: string]: {
    Masculino: number;
    Feminino: number;
    Misto: number;
  };
}

export function DashboardTable({ data }: DashboardTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof BranchAnalytics;
    direction: 'asc' | 'desc';
  } | null>(null);

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return 0;
  });

  const filteredData = sortedData.filter(branch =>
    branch.filial.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSort = (key: keyof BranchAnalytics) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const formatModalidadesPopulares = (modalidadesPopulares: ModalityData | null): JSX.Element => {
    console.log("Formatting modalidades populares:", modalidadesPopulares);
    
    if (!modalidadesPopulares || Object.keys(modalidadesPopulares).length === 0) {
      return (
        <span className="text-muted-foreground">
          Nenhuma modalidade popular disponível
        </span>
      );
    }

    const getTagVariant = (index: number): "default" | "secondary" | "destructive" => {
      const variants: ("default" | "secondary" | "destructive")[] = ["default", "secondary", "destructive"];
      return variants[index % variants.length];
    };

    const modalityTags = Object.entries(modalidadesPopulares)
      .map(([modalidade, categorias]) => {
        const totalInscritos = Object.values(categorias).reduce((sum, count) => sum + count, 0);
        
        if (totalInscritos === 0) return null;

        return (
          <Badge
            key={modalidade}
            variant={getTagVariant(Math.floor(Math.random() * 3))}
            className="inline-flex items-center gap-1 mr-2 mb-2"
          >
            <Tag className="w-3 h-3" />
            <span>{modalidade}</span>
            <span className="ml-1 text-xs opacity-75">
              ({totalInscritos} {totalInscritos === 1 ? 'inscrição(ões)' : 'inscrições nas modalidades'})
            </span>
          </Badge>
        );
      })
      .filter(Boolean);

    return (
      <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto pr-2">
        {modalityTags}
      </div>
    );
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-olimpics-text">Dados por Filial</CardTitle>
        <div className="flex items-center py-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por filial..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSort('filial')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Filial</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 transition-colors text-right"
                  onClick={() => handleSort('total_inscritos')}
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Total de Inscrições</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>
                  Modalidades por Categoria
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((branch) => (
                <TableRow key={branch.filial_id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{branch.filial}</TableCell>
                  <TableCell className="text-right">{branch.total_inscritos}</TableCell>
                  <TableCell>{formatModalidadesPopulares(branch.modalidades_populares as ModalityData)}</TableCell>
                </TableRow>
              ))}
              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    Nenhum resultado encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}