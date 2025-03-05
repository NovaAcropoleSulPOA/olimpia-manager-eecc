
export interface EnrolledUser {
  nome_atleta: string;
  tipo_documento: string;
  numero_documento: string;
  telefone: string;
  email: string;
  filial: string;
  filial_id: string;
  modalidade_nome: string;
  // Optional properties from the alternative data source
  id?: any;
  atleta_id?: any;
  modalidade_id?: any;
  status_inscricao?: any;
  evento_id?: string;
}

export interface GroupedEnrollments {
  [modalidade: string]: {
    [filial: string]: EnrolledUser[];
  };
}

export interface EnrollmentTableProps {
  users: EnrolledUser[];
}

export interface FilialSectionProps {
  filial: string;
  users: EnrolledUser[];
  modalidade: string;
  isExpanded: boolean;
  onToggle: () => void;
}

export interface ModalitySectionProps {
  modalidade: string;
  filiais: {
    [filial: string]: EnrolledUser[];
  };
  searchTerm: string;
  isExpanded: boolean;
  expandedFilial: string | null;
  allSectionsExpanded: boolean;
  onModalityToggle: () => void;
  onFilialToggle: (filialKey: string) => void;
}

export interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onToggleAll: () => void;
  onPrint: () => void;
  allSectionsExpanded: boolean;
}
