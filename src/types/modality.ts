
export interface Modality {
  id: number;
  nome: string;
  categoria?: string;
  tipo_modalidade: string;
  vagas_ocupadas: number;
  limite_vagas: number;
  grupo?: string;
  faixa_etaria: string;
}

export interface RegisteredModality {
  id: number;
  status: string;
  data_inscricao: string | null;
  modalidade: {
    id: number;
    nome: string;
    categoria: string;
    tipo_modalidade: string;
  };
}
