export interface AthleteModality {
  id: string;
  modalidade: string;
  status: string;
  justificativa_status: string;
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

export interface Branch {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
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
  ranking_filiais: Array<{
    total_pontos: number;
  }>;
  atletas_por_categoria: Array<{
    categoria: string;
    quantidade: number;
  }>;
  media_pontuacao_por_modalidade: Array<{
    modalidade: string;
    media_pontuacao: number;
  }>;
}
