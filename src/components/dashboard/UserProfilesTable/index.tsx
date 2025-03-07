
import { useState } from "react";
import { UserProfilesTableProps } from "./types";
import { UserSearchAndFilters } from "./UserSearchAndFilters";
import { UsersTable } from "./UsersTable";
import { TablePagination } from "./TablePagination";
import { UserProfileModal } from "../UserProfileModal";

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olimpics-green-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <UserSearchAndFilters 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        branchFilter={branchFilter}
        setBranchFilter={setBranchFilter}
        branches={branches}
        setCurrentPage={setCurrentPage}
      />

      <UsersTable 
        paginatedUsers={paginatedUsers}
        setSelectedUser={setSelectedUser}
      />

      {filteredUsers.length > itemsPerPage && (
        <TablePagination 
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      )}

      <UserProfileModal
        user={selectedUser}
        open={!!selectedUser}
        onOpenChange={() => setSelectedUser(null)}
      />
    </div>
  );
};
