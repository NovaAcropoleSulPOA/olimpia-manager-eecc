
export interface Branch {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
}

interface PontuacaoModalidade {
  modalidade: string;
  media_pontuacao: number;
}

interface CategoriaQuantidade {
  categoria: string;
  quantidade: number;
}

interface RankingFilial {
  total_pontos: number;
}

export interface BranchAnalytics {
  filial_id: string;
  filial: string;
  total_inscritos: number;
  valor_total_pago: number;
  valor_total_pendente: number;
  modalidades_populares: Array<{
    modalidade: string;
    total_inscritos: number;
  }>;
  inscritos_por_status_pagamento: Array<{
    status_pagamento: string;
    quantidade: number;
  }>;
  inscritos_por_status: Array<{
    status_inscricao: string;
    quantidade: number;
  }>;
  ranking_filiais: RankingFilial[];
  atletas_por_categoria: CategoriaQuantidade[];
  media_pontuacao_por_modalidade: PontuacaoModalidade[];
}

export interface AthleteModality {
  id: string;
  modalidade: string;
  status: string;
  justificativa_status?: string;
}

export interface AthleteManagement {
  id: string;
  nome_atleta: string;
  email: string;
  telefone: string;
  tipo_documento: string;
  numero_documento: string;
  genero: string;
  numero_identificador?: string;
  status_confirmacao: boolean;
  filial_id: string;
  filial_nome: string;
  status_pagamento: 'pendente' | 'confirmado' | 'cancelado';
  usuario_registrador_id?: string;
  registrador_nome?: string;
  registrador_email?: string;
  modalidades: AthleteModality[];
  evento_id: string;
}

// Re-export all functions and types from other files
export * from './athletes';
export * from './branches';
export * from './modalities';
export * from './profiles';
export * from './payments';
