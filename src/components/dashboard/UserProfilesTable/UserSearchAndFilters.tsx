
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Building } from "lucide-react";
import { UserSearchAndFiltersProps } from "./types";

export const UserSearchAndFilters = ({ 
  searchTerm, 
  setSearchTerm, 
  branchFilter, 
  setBranchFilter, 
  branches,
  setCurrentPage 
}: UserSearchAndFiltersProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou email..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset to first page on search
          }}
          className="pl-10 border-olimpics-green-primary/20 focus-visible:ring-olimpics-green-primary/30"
        />
      </div>
      <div className="relative">
        <Select 
          value={branchFilter} 
          onValueChange={(value) => {
            setBranchFilter(value);
            setCurrentPage(1); // Reset to first page on filter change
          }}
        >
          <SelectTrigger className="w-full md:w-[220px] border-olimpics-green-primary/20 focus:ring-olimpics-green-primary/30">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Filtrar por filial" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as filiais</SelectItem>
            {branches.map((branch) => (
              <SelectItem key={branch.id} value={branch.id}>
                {branch.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
