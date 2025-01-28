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

interface DashboardTableProps {
  data: BranchAnalytics[];
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

  const formatModalities = (modalidades: Array<{ modalidade: string; total_inscritos: number }>) => {
    if (!modalidades || modalidades.length === 0) return "Nenhuma modalidade";
    return modalidades
      .map(({ modalidade, total_inscritos }) => `${modalidade} (${total_inscritos})`)
      .join(", ");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados por Filial</CardTitle>
        <div className="flex items-center py-4">
          <Input
            placeholder="Buscar por filial..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort('filial')}
                >
                  Filial
                </TableHead>
                <TableHead
                  className="cursor-pointer text-right"
                  onClick={() => handleSort('total_inscritos')}
                >
                  Total de Atletas
                </TableHead>
                <TableHead>
                  Modalidades Disponíveis
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((branch) => (
                <TableRow key={branch.filial_id}>
                  <TableCell className="font-medium">{branch.filial}</TableCell>
                  <TableCell className="text-right">{branch.total_inscritos}</TableCell>
                  <TableCell>{formatModalities(branch.modalidades_populares)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}