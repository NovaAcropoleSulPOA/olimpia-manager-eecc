
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
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
    <div className="flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou email..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset to first page on search
          }}
          className="pl-10"
        />
      </div>
      <Select 
        value={branchFilter} 
        onValueChange={(value) => {
          setBranchFilter(value);
          setCurrentPage(1); // Reset to first page on filter change
        }}
      >
        <SelectTrigger className="w-full md:w-[200px]">
          <SelectValue placeholder="Filtrar por filial" />
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
  );
};
