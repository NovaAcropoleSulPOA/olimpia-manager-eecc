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
import { ArrowUpDown, Search } from "lucide-react";

interface DashboardTableProps {
  data: BranchAnalytics[];
}

interface ModalityCount {
  modalidade: string;
  total_inscritos: number;
}

type ModalityRecord = Record<string, number>;

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

  const formatModalityRecord = (modalityRecord: ModalityRecord | null): string => {
    if (!modalityRecord || Object.keys(modalityRecord).length === 0) return "";
    
    return Object.entries(modalityRecord)
      .map(([modalidade, total_inscritos]) => `${modalidade} (${total_inscritos})`)
      .join(", ");
  };

  const formatTopModalities = (branch: BranchAnalytics) => {
    const categories = {
      Masculino: branch.top_modalidades_masculino,
      Feminino: branch.top_modalidades_feminino,
      Misto: branch.top_modalidades_misto
    };

    const formattedCategories = Object.entries(categories)
      .map(([category, modalities]) => {
        const modalityList = formatModalityRecord(modalities as ModalityRecord);
        return modalityList ? `${category}: ${modalityList}` : null;
      })
      .filter(Boolean);

    return formattedCategories.length > 0 
      ? formattedCategories.join(" | ")
      : "Nenhuma modalidade registrada";
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
                    <span>Total de Atletas</span>
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
                  <TableCell>{formatTopModalities(branch)}</TableCell>
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