
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

export * from './athletes';
export * from './branches';
export * from './modalities';
export * from './profiles';
