
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { BranchAnalytics } from "@/lib/api";
import { useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

interface SortConfig {
  key: keyof BranchAnalytics | null;
  direction: 'asc' | 'desc';
}

interface ModalitiesTableProps {
  data: BranchAnalytics[];
}

// Move the sortBranches function before it's used
const sortBranches = (
  branches: BranchAnalytics[],
  sortConfig: SortConfig
): BranchAnalytics[] => {
  return [...branches].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let aValue: any;
    let bValue: any;

    switch (sortConfig.key) {
      case 'total_inscritos_geral':
        aValue = a.total_inscritos_geral || 0;
        bValue = b.total_inscritos_geral || 0;
        break;
      case 'filial':
        aValue = a.filial || '';
        bValue = b.filial || '';
        break;
      case 'total_inscritos_modalidades':
        aValue = a.total_inscritos_modalidades || 0;
        bValue = b.total_inscritos_modalidades || 0;
        break;
      case 'valor_total_pago':
        aValue = a.valor_total_pago || 0;
        bValue = b.valor_total_pago || 0;
        break;
      default:
        aValue = a[sortConfig.key];
        bValue = b[sortConfig.key];
    }

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });
};

export function ModalitiesTable({ data }: ModalitiesTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });

  const handleSort = (key: keyof BranchAnalytics) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: keyof BranchAnalytics) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4 ml-1" /> : <ArrowDown className="w-4 h-4 ml-1" />;
    }
    return null;
  };

  const sortedBranches = sortBranches(data, sortConfig);

  return (
    <Table>
      <TableCaption>Dados detalhados das filiais e suas modalidades.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead onClick={() => handleSort('filial')}>
            Filial {getSortIndicator('filial')}
          </TableHead>
          <TableHead onClick={() => handleSort('total_inscritos_geral')}>
            Total de Inscritos {getSortIndicator('total_inscritos_geral')}
          </TableHead>
          <TableHead onClick={() => handleSort('total_inscritos_modalidades')}>
            Inscritos em Modalidades {getSortIndicator('total_inscritos_modalidades')}
          </TableHead>
          <TableHead onClick={() => handleSort('valor_total_pago')}>
            Valor Total Pago {getSortIndicator('valor_total_pago')}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedBranches.map((branch) => (
          <TableRow key={branch.filial_id}>
            <TableCell>{branch.filial}</TableCell>
            <TableCell>{branch.total_inscritos_geral}</TableCell>
            <TableCell>{branch.total_inscritos_modalidades}</TableCell>
            <TableCell>
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(branch.valor_total_pago)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
