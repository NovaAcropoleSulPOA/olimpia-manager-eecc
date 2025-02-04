import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface AthleteFiltersProps {
  nameFilter: string;
  onNameFilterChange: (value: string) => void;
  branchFilter: string;
  onBranchFilterChange: (value: string) => void;
  paymentStatusFilter: string;
  onPaymentStatusFilterChange: (value: string) => void;
  branches: { id: string; nome: string; }[];
}

export function AthleteFilters({
  nameFilter,
  onNameFilterChange,
  branchFilter,
  onBranchFilterChange,
  paymentStatusFilter,
  onPaymentStatusFilterChange,
  branches,
}: AthleteFiltersProps) {
  return (
    <div className="space-y-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name-filter">Nome do Atleta</Label>
          <Input
            id="name-filter"
            placeholder="Buscar por nome..."
            value={nameFilter}
            onChange={(e) => onNameFilterChange(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Filial</Label>
          <Select value={branchFilter} onValueChange={onBranchFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as filiais" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as filiais</SelectItem>
              {branches.map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Status de Pagamento</Label>
          <Select value={paymentStatusFilter} onValueChange={onPaymentStatusFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os status</SelectItem>
              <SelectItem value="confirmado">Confirmado</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}