
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, UserCog } from "lucide-react";
import { UserProfileModal } from "./UserProfileModal";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface UserProfilesTableProps {
  data: any[];
  branches: any[];
  isLoading: boolean;
}

export const UserProfilesTable = ({ data, branches, isLoading }: UserProfilesTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sort users alphabetically by name
  const sortedUsers = [...data].sort((a, b) => 
    a.nome_completo.localeCompare(b.nome_completo, 'pt-BR', { sensitivity: 'base' })
  );

  const filteredUsers = sortedUsers.filter((user) => {
    const matchesSearch = 
      user.nome_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = branchFilter === "all" || user.filial_id === branchFilter;
    return matchesSearch && matchesBranch;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      for (let i = 1; i <= 4; i++) {
        pageNumbers.push(i);
      }
      pageNumbers.push('ellipsis');
      pageNumbers.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      pageNumbers.push(1);
      pageNumbers.push('ellipsis');
      for (let i = totalPages - 3; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      pageNumbers.push('ellipsis');
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pageNumbers.push(i);
      }
      pageNumbers.push('ellipsis');
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olimpics-green-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Filial</TableHead>
              <TableHead>Perfis</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.nome_completo}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.filial_nome}</TableCell>
                  <TableCell>
                    {user.profiles?.map((profile: any) => profile.perfil_nome).join(", ") || "Sem perfis"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedUser(user)}
                    >
                      <UserCog className="h-4 w-4 mr-2" />
                      Gerenciar Perfis
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhum usuário encontrado com os filtros selecionados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {filteredUsers.length > itemsPerPage && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            
            {getPageNumbers().map((pageNumber, index) => (
              <PaginationItem key={index}>
                {pageNumber === 'ellipsis' ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    onClick={() => setCurrentPage(pageNumber as number)}
                    isActive={currentPage === pageNumber}
                    className="cursor-pointer"
                  >
                    {pageNumber}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <UserProfileModal
        user={selectedUser}
        open={!!selectedUser}
        onOpenChange={() => setSelectedUser(null)}
      />
    </div>
  );
};
