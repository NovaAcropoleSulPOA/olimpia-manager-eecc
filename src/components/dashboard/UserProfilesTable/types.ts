
export interface UserProfilesTableProps {
  data: any[];
  branches: any[];
  isLoading: boolean;
}

export interface UserSearchAndFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  branchFilter: string;
  setBranchFilter: (filter: string) => void;
  branches: any[];
  setCurrentPage: (page: number) => void;
}

export interface UsersTableProps {
  paginatedUsers: any[];
  setSelectedUser: (user: any) => void;
}

export interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}
