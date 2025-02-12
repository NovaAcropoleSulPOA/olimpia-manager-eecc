
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
