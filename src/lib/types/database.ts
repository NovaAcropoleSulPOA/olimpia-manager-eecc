
export interface Event {
  id: string;
  nome: string;
  descricao: string | null;
  data_inicio_inscricao: string;
  data_fim_inscricao: string;
  foto_evento: string | null;
  tipo: 'estadual' | 'nacional' | 'internacional' | 'regional';
  created_at: string | null;
  updated_at: string | null;
}

export interface EventBranch {
  evento_id: string;
  filial_id: string;
}

export interface ProfileType {
  id: string;
  codigo: string;
  descricao: string | null;
}

export interface Profile {
  id: number;
  nome: string;
  descricao: string | null;
  evento_id: string;
  perfil_tipo_id: string;
}

export interface UserRole {
  id: number;
  usuario_id: string;
  perfil_id: number;
  evento_id: string;
}
