
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
  total_atletas_pendentes_pagamento: number;
  inscritos_por_status_pagamento: Record<string, number>;
  modalidades_populares: Record<string, {
    Masculino: number;
    Feminino: number;
    Misto: number;
  }>;
  media_pontuacao_por_modalidade: Record<string, number>;
  top_modalidades_masculino: Record<string, number>;
  top_modalidades_feminino: Record<string, number>;
  top_modalidades_misto: Record<string, number>;
}
